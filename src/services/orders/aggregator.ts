import { Op } from "sequelize"
import dbInstance from "../database"
import kafka from "../utils/kafka"
import { INVENTORY_STATUS, PAYMENT_STATUS } from "../../utils/common"

class AggregatorConsumer {
    #consumer
    constructor() {
        this.#consumer = kafka.client.consumer({ groupId: "order-aggregator" })
    }

    async init() {
        try {
            await this.#consumer.connect()
            await this.#consumer.subscribe({ topics: ["inventory.reserved", "payment.authorized"], fromBeginning: false })

            await this.#consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const msgObj = JSON.parse(message.value?.toString() || "")
                    console.log("Event consumed in aggregator: ", msgObj)
                    switch (topic) {
                        case "inventory.reserved":
                            await this.updateAggregate("inventory", msgObj)
                            break
                        case "payment.authorized":
                            await this.updateAggregate("payment", msgObj)
                            break
                        default: return
                    }
                }
            })
        } catch (err) {
            console.log("Error connecting the order aggregate consumer: ", err)
        }
    }

    async updateAggregate(type: string, { order_id, user_id, event_version }: { order_id: string, user_id: string, event_version: number }) {
        let orderArr = await dbInstance.getOrderService({
            where: {
                orderId: order_id,
            },
            options: {}
        })
        let [order] = orderArr
        if (!order) return

        switch (type) {
            case "inventory":
                await dbInstance.updateOrderService(
                    { inventoryStatus: INVENTORY_STATUS.RESERVED },
                    {
                        where: { orderId: order_id }
                    })
                order.inventoryStatus = INVENTORY_STATUS.RESERVED
                break
            case "payment":
                await dbInstance.updateOrderService(
                    { paymentStatus: PAYMENT_STATUS.AUTHORIZED },
                    {
                        where: { orderId: order_id }
                    })
                order.paymentStatus = PAYMENT_STATUS.AUTHORIZED
                break
        }

        if (
            order.paymentStatus === PAYMENT_STATUS.AUTHORIZED &&
            order.inventoryStatus === INVENTORY_STATUS.RESERVED
        ) {
            await kafka.produce("order.ready", [{
                value: JSON.stringify({
                    event_type: "OrderReady",
                    event_version,
                    order_id,
                    user_id,
                })
            }])
        }
    }

    async cancelPendingOrders() {
        try {
            const orders = await dbInstance.getOrderService({
                where: {
                    [Op.and]: [
                        {
                            paymentStatus: {
                                [Op.eq]: PAYMENT_STATUS.PENDING,
                            },
                        },
                        {
                            inventoryStatus: {
                                [Op.eq]: INVENTORY_STATUS.PENDING,
                            }
                        }
                    ]
                },
                options: {},
            })
            for (const order of orders) {
                const { expiresAt } = order
                if (!expiresAt) continue
                let now = new Date()
                if (now > expiresAt) {
                    await dbInstance.updateOrderService(
                        {
                            paymentStatus: PAYMENT_STATUS.FAILED,
                            inventoryStatus: INVENTORY_STATUS.FAILED,
                        },
                        {
                            where: { orderId: { [Op.eq]: order.orderId } }
                        }
                    )
                    await kafka.produce("order.cancelled", [{
                        value: JSON.stringify({
                            event_version: 1,
                            eventType: "OrderCancelled",
                            order_id: order.orderId,
                        })
                    }])
                }
            }
        } catch (err) {
            console.log("Error updating the failed orders: ", err)
        }
    }
}

const orderAggregator = new AggregatorConsumer()

export default orderAggregator

/**
 * save the order with pending states.
 * have a background cron the keeps checking this table and updates the state to a cancelled order and emits order.cancelled.
 */