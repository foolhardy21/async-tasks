import kafka from "../utils/kafka"

class OrderFraudDetection {
    #consumer
    constructor() {
        this.#consumer = kafka.client.consumer({ groupId: "order-fraud-detection" })
    }

    async init() {
        try {
            await this.#consumer.connect()
            await this.#consumer.subscribe({ topic: "order.created", fromBeginning: true })
            await this.#consumer.run({
                eachMessage: async ({ topic, message }) => {
                    const msgObj = JSON.parse(message.value?.toString() || "")

                    const { event_version } = msgObj
                    switch (event_version) {
                        case 1:
                            break
                        case 2:
                            console.log("Mesage consumed in fraud detection: ", topic, event_version, msgObj)
                            break
                        default: return
                    }
                }
            })
        } catch (err) {
            console.log("Error subscribing order fraud detection consumer: ", err)
        }
    }
}

const orderFraudDetection = new OrderFraudDetection()

export default orderFraudDetection