import nodeCron from "node-cron"
import { queueManager, QueueTask, retryQueueManager } from "./queueManager"
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
        })
    }

    executeTaskQueue() {
        let currentTask
        try {
            if (queueManager.size()) {
                currentTask = queueManager.dequeue()
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
            retryQueueManager.enqueue(currentTask as QueueTask)
        }
    }
    executeRetryQueue() {
        let currentTask
        try {
            if (retryQueueManager.size()) {
                currentTask = retryQueueManager.dequeue()
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
        }
    }
}
const backgroundTasks = new BackgroundTasks()

export default backgroundTasks