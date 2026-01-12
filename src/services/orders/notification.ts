import kafka from "../utils/kafka"

class OrderNotification {
    #consumer
    constructor() {
        this.#consumer = kafka.client.consumer({ groupId: "order-notification" })
    }

    async init() {
        try {
            await this.#consumer.connect()
            await this.#consumer.subscribe({ topics: ["order.ready", "order.cancelled"], fromBeginning: true })
            await this.#consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const msgObj = JSON.parse(message.value?.toString() || "")
                    const { event_version, order_id } = msgObj

                    switch (event_version) {
                        case 2:
                            console.log(topic, event_version, "Notification sent for: ", order_id, msgObj)
                            break
                        default: return
                    }
                }
            })
        } catch (err) {
            console.log("Error subscribing order notification consumer: ", err)
        }
    }
}

const orderNotification = new OrderNotification()

export default orderNotification