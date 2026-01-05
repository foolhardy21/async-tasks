import { Kafka as KafkaLib, Producer } from "kafkajs";

class Kafka {
    client: KafkaLib
    #producer?: Producer

    constructor() {
        this.client = new KafkaLib({
            clientId: "async-tasks",
            brokers: [(process.env.KAFKA_BROKER1 || "")],
        })
    }

    async init() {
        this.#producer = this.client.producer()
        try {
            await this.#producer.connect()
        } catch (err) {
            console.log("Error connecting the producer: ", err)
        }
    }

    async produce(topic: string = "", messages: any[]) {
        if (this.#producer && topic && messages.length) {
            try {
                const res = await this.#producer.send({
                    topic,
                    messages,
                })
                console.log("Event produced: ", res)
            } catch (err) {
                console.log("Error sending the event: ", err)
            }
        }
    }
}
const kafka = new Kafka()
kafka.init()

export default kafka