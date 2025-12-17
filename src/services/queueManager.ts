import { EVENTS } from "../utils/eventsUtils"

export type QueueTask = {
    type: typeof EVENTS.IMAGE_UPLOAD,
    data: Record<string, unknown>,
}

class QueueManager {
    #queue: Array<QueueTask> = []

    constructor() { }

    enqueue(task: QueueTask) {
        console.log("Pushing the task in queue: ", task)
        this.#queue.push(task)
    }

    dequeue(): QueueTask | undefined {
        console.log("Removing the task from queue")
        return this.#queue.shift()
    }

    size(): number {
        return this.#queue.length
    }
}

const queueManager = new QueueManager()
const retryQueueManager = new QueueManager()
const retryFallbackQueueManager = new QueueManager()

export {
    queueManager,
    retryQueueManager,
    retryFallbackQueueManager,
    QueueManager,
}