class BackgroundTasksQueue {
    #taskQueue: string[]

    constructor() {
        this.#taskQueue = []
    }

    enqueue(item: string) {
        this.#taskQueue.push(item)
    }

    dequeue() {
        return this.#taskQueue.shift()
    }

    getFront() {
        return this.#taskQueue[0]
    }

    isEmpty() {
        return !this.#taskQueue.length
    }
}

const backgroundTasks = new BackgroundTasksQueue()

export default backgroundTasks

export const ALLOWED_BACKGROUND_TASKS = new Set(["generate-thumbnail"]) 