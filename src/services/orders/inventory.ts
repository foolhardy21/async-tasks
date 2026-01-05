import kafka from "../utils/kafka"

class OrderInventory {
    #consumer
    constructor() {
        this.#consumer = kafka.client.consumer({ groupId: "order-inventory" })
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
                            console.log("Mesage consumed in inventory: ", topic, event_version, msgObj)
                            break
                        default: return
                    }
                }
            })
        } catch (err) {
            console.log("Error subscribing order inventory consumer: ", err)
        }
    }
}

const orderInventory = new OrderInventory()

export default orderInventory