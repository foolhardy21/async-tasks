import { Op } from "sequelize";
import cron from "node-cron";
import { Worker } from "worker_threads";
import backgroundTasks from "../utils/backgroundTasksUtils";
import dbInstance from "./database";

class BackgroundTasksCron {
    #workers: { id: number, occupied: boolean }[]
    #usersInProgress: number[]
    #eventsMap: Record<string, Function>

    constructor() {
        this.#workers = [{ id: 1, occupied: false }, { id: 2, occupied: false }]
        this.#usersInProgress = []
        this.#eventsMap = {}
    }

    start() {
        cron.schedule("* * * * *", async () => {
            for (const workerObj of this.#workers) {
                if (!workerObj.occupied) {
                    const task = backgroundTasks.dequeue()
                    console.log("current task", task)
                    switch (task) {
                        case "generate-thumbnail":
                            let usersWithNoThumbnails = await dbInstance.get({
                                where: {
                                    thumbnailImage: { [Op.is]: null },
                                },
                                options: {},
                            }) || []
                            usersWithNoThumbnails = usersWithNoThumbnails
                                .filter(user => !this.#usersInProgress.includes(user.id))
                            if (!usersWithNoThumbnails.length) return
                            this.subscribeEvent("logs", this.handleLog)
                            this.subscribeEvent("alert-admin", this.handleAdminAlert)
                            const worker = new Worker("./src/scripts/resizeImage.ts", {
                                workerData: { workerId: workerObj.id, usersWithNoThumbnails }
                            })
                            this.#usersInProgress.push(...usersWithNoThumbnails.map(user => user.id))
                            worker.on("message", this.updateWorkerStatus.bind(this, workerObj.id, false))
                            worker.on("error", this.updateWorkerStatus.bind(this, workerObj.id, false))
                            break
                        default: return
                    }
                    if (task) {
                        this.updateWorkerStatus(workerObj.id, true)
                    }
                }
            }
        })
    }

    async updateWorkerStatus(workerId: number, newOccupiedStatus: boolean, ...args: any[]) {
        this.#workers = this.#workers.map(workerObj => {
            if (workerObj.id === workerId) {
                return { ...workerObj, occupied: newOccupiedStatus }
            }
            return workerObj
        })
        if (newOccupiedStatus) return

        const { task } = args[0].data
        switch (task) {
            case "generate-thumbnail":
                const { thumbnails } = args[0].data
                const usersCompleted = thumbnails.map((thumbnail: any) => thumbnail.userId)
                this.#usersInProgress = this.#usersInProgress
                    .filter(userInProgress => !usersCompleted.includes(userInProgress))
                try {
                    for (const user of thumbnails) {
                        await dbInstance.update(
                            {
                                thumbnailImage: user.path
                            },
                            {
                                where: {
                                    id: { [Op.is]: user.userId }
                                }
                            }
                        )
                    }
                } catch (err) {
                    console.log(err)
                } finally {
                    this.fireEvent("logs", { data: args[0].data })
                    this.fireEvent("alert-admin", { data: args[0].data })
                }
                break
            default: return
        }
    }

    subscribeEvent(event: string, handler: Function) {
        this.#eventsMap = {
            ...this.#eventsMap,
            [event]: handler
        }
        console.log("subscribed event:", event)
    }

    fireEvent(event: string, data: Record<string, unknown>) {
        this.#eventsMap[event].call(this, event, data)
        delete this.#eventsMap[event]
        console.log("fired event:", event)
    }

    handleLog(event: string, data: any) {
        console.log("logging for", event, data)
    }

    handleAdminAlert(event: string, data: any) {
        console.log("sending alert for", event, data)
    }

}

export default BackgroundTasksCron