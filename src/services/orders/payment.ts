import kafka from "../utils/kafka"

class OrderPayment {
    #consumer
    constructor() {
        this.#consumer = kafka.client.consumer({ groupId: "order-payment" })
    }

    async init() {
        try {
            await this.#consumer.connect()
            await this.#consumer.subscribe({ topic: "order.created", fromBeginning: true })
            await this.#consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const msgObj = JSON.parse(message.value?.toString() || "")
                    const { event_version, order_id, user_id } = msgObj

                    switch (event_version) {
                        case 2:
                            console.log(topic, event_version, "Payment processed for: ", order_id, msgObj)

                            await kafka.produce("payment.authorized", [{
                                value: JSON.stringify({
                                    event_type: "PaymentAuthorized",
                                    event_version,
                                    order_id,
                                    user_id,
                                })
                            }])
                            break
                        default: return
                    }
                }
            })
        } catch (err) {
            console.log("Error subscribing order payment consumer: ", err)
        }
    }
}

const orderPayment = new OrderPayment()

export default orderPayment