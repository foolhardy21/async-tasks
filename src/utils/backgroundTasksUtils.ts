class BackgroundTasksQueue {
    #generateThumbnailQueue: string[]
    #logQueue: string[]
    #notifyAdminQueue: string[]

    constructor() {
        this.#generateThumbnailQueue = []
        this.#logQueue = []
        this.#notifyAdminQueue = []
    }

    enqueueInGenThumbnail(item: string) {
        this.#generateThumbnailQueue.push(item)
    }
    enqueueInLog(item: string) {
        this.#logQueue.push(item)
    }
    enqueueInNotifyAdmin(item: string) {
        this.#notifyAdminQueue.push(item)
    }

    dequeueFromGenThumbnail() {
        return this.#generateThumbnailQueue.shift()
    }
    dequeueFromLog() {
        return this.#logQueue.shift()
    }
    dequeueFromNotifyAdmin() {
        return this.#notifyAdminQueue.shift()
    }

    getGenThumbnailFront() {
        return this.#generateThumbnailQueue[0]
    }
    getLogFront() {
        return this.#logQueue[0]
    }
    getNotifyAdminFront() {
        return this.#notifyAdminQueue[0]
    }

    isGenThumbnailEmpty() {
        return !this.#generateThumbnailQueue.length
    }
    isLogEmpty() {
        return !this.#logQueue.length
    }
    isNotifyAdminEmpty() {
        return !this.#notifyAdminQueue.length
    }
}

const backgroundTasks = new BackgroundTasksQueue()

export default backgroundTasks

export const ALLOWED_BACKGROUND_TASKS = new Set(["generate-thumbnail", "log-upload", "notify-admin"]) 