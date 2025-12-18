import nodeCron from "node-cron"
import { queueManager, QueueTask, retryFallbackQueueManager, retryQueueManager, QueueManager } from "./queueManager"
import { EVENTS } from "../utils/eventsUtils"
import userImgServiceInstance from "./userImage"

export type ImageUploadTask = {
    path?: string
    userId?: string
}

class BackgroundTasks {
    start() {
        nodeCron.schedule("* * * * *", () => {
            console.log("Cron running")
            this.executeTaskQueue()
            this.executeRetryQueue()
            this.executeRetryFallbackQueue()
        })
    }

    runTask(sourceQueue: QueueManager, fallbackQueue: QueueManager) {
        let currentTask
        try {
            if (sourceQueue.size()) {
                currentTask = sourceQueue.dequeue()
                console.log("Cron executing current task: ", currentTask)
                const taskMeta = currentTask?.data as ImageUploadTask
                switch (currentTask?.type) {
                    case EVENTS.IMAGE_UPLOAD:
                        userImgServiceInstance.handleImageUpload({ path: taskMeta.path || "", userId: taskMeta.userId || "" })
                        break
                    default: return
                }
            }
        } catch (err) {
            console.log("Error executing the cron: ", err)
            fallbackQueue.enqueue(currentTask as QueueTask)
        }
    }

    executeTaskQueue() {
        this.runTask(queueManager, retryQueueManager)
    }
    executeRetryQueue() {
        this.runTask(retryQueueManager, retryFallbackQueueManager)
    }
    executeRetryFallbackQueue() {
        this.runTask(retryFallbackQueueManager, retryFallbackQueueManager)
    }
}
const backgroundTasks = new BackgroundTasks()

export default backgroundTasks