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

    async updateAggregate(type: string, { order_id, user_id }: { order_id: string, user_id: string }) {
        let orderArr = await dbInstance.getOrderService({
            where: {
                orderId: order_id,
            },
            options: {}
        })
        let [order] = orderArr
        if (!orderArr.length) {
            order = await dbInstance.createOrderService({
                orderId: order_id,
                paymentStatus: PAYMENT_STATUS.PENDING,
                inventoryStatus: INVENTORY_STATUS.PENDING,
            })
        }

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
                    event_version: 2,
                    order_id,
                    user_id,
                })
            }])
        }
    }
}

const orderAggregator = new AggregatorConsumer()

export default orderAggregator