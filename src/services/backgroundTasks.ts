import nodeCron from "node-cron"
import queueManager, { QueueTask } from "./queueManager"
import { EVENTS } from "../utils/eventsUtils"
import userImgServiceInstance from "./userImage"

export type ImageUploadTask = {
    path?: string
    userId?: string
}

class BackgroundTasks {
    start() {
        nodeCron.schedule("* * * * *", function () {
            console.log("Cron running")
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
                queueManager.enqueue(currentTask as QueueTask)
            }
        })
    }
}

const backgroundTasks = new BackgroundTasks()

export default backgroundTasks