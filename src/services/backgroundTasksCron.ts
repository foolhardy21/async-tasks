import { Op } from "sequelize";
import cron from "node-cron";
import { Worker } from "worker_threads";
import backgroundTasks, { ALLOWED_BACKGROUND_TASKS } from "../utils/backgroundTasksUtils";
import dbInstance from "./database";

class BackgroundTasksCron {
    #workers: { id: number, task: string, occupied: boolean }[]

    constructor() {
        this.#workers = Array.from(ALLOWED_BACKGROUND_TASKS).map((task, idx) => ({ id: idx + 1, task, occupied: false }))
    }

    start() {
        cron.schedule("* * * * *", async () => {
            let thumbnailTask, thumbnailTaskWorker, logTask, logTaskWorker, adminTask, adminTaskWorker
            thumbnailTask = backgroundTasks.dequeueFromGenThumbnail()
            if (!thumbnailTask) return

            thumbnailTaskWorker = this.#workers.find(worker => worker.task === thumbnailTask)
            if (thumbnailTaskWorker?.occupied) return

            let usersWithNoThumbnails = await dbInstance.get({
                where: {
                    thumbnailImage: { [Op.is]: null },
                },
                options: {},
            }) || []
            if (!usersWithNoThumbnails.length) return

            this.updateWorkerStatus(thumbnailTask, true)
            const worker1 = new Worker("./src/scripts/resizeImage.ts", {
                workerData: { workerId: thumbnailTaskWorker?.id, usersWithNoThumbnails }
            })
            worker1.on("message", this.updateWorkerStatus.bind(this, thumbnailTask, false))
            worker1.on("error", this.updateWorkerStatus.bind(this, thumbnailTask, false))

            logTask = backgroundTasks.dequeueFromLog()
            if (!logTask) return

            logTaskWorker = this.#workers.find(worker => worker.task === logTask)
            if (logTaskWorker?.occupied) return

            this.updateWorkerStatus(logTask, true)
            const worker2 = new Worker("./src/scripts/uploadLogs.ts")
            worker2.on("message", this.updateWorkerStatus.bind(this, logTask, false))
            worker2.on("error", this.updateWorkerStatus.bind(this, logTask, false))

            adminTask = backgroundTasks.dequeueFromNotifyAdmin()
            if (!adminTask) return

            adminTaskWorker = this.#workers.find(worker => worker.task === adminTask)
            if (adminTaskWorker?.occupied) return

            this.updateWorkerStatus(adminTask, true)
            const worker3 = new Worker("./src/scripts/notifyAdmin.ts")
            worker3.on("message", this.updateWorkerStatus.bind(this, adminTask, false))
            worker3.on("error", this.updateWorkerStatus.bind(this, adminTask, false))

        })
    }

    async updateWorkerStatus(task: string, newOccupiedStatus: boolean, ...args: any[]) {
        if (!task) return

        this.#workers = this.#workers.map(workerObj => {
            if (workerObj.task === task) {
                return { ...workerObj, occupied: newOccupiedStatus }
            }
            return workerObj
        })
        if (newOccupiedStatus) return

        switch (task) {
            case "generate-thumbnail":
                const { thumbnails } = args[0].data
                try {
                    for (const user of thumbnails) {
                        await dbInstance.update(
                            {
                                thumbnailImage: user.path
                            },
                            {
                                where: { id: { [Op.is]: user.userId } }
                            }
                        )
                    }
                } catch (err) {
                    console.log(err)
                }
                break
            case "log-upload":
                const logData = args[0].data
                console.log("Logs upload:", logData)
                break
            case "notify-admin":
                const adminData = args[0].data
                console.log("Admin notify:", adminData)
                break

            default: return
        }
    }

}

export default BackgroundTasksCron