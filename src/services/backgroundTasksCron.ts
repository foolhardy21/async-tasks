import { Op } from "sequelize";
import cron from "node-cron";
import { Worker } from "worker_threads";
import backgroundTasks from "../utils/backgroundTasksUtils";
import dbInstance from "./database";

class BackgroundTasksCron {
    #workers: { id: number, occupied: boolean }[]
    #usersInProgress: number[]

    constructor() {
        this.#workers = [{ id: 1, occupied: false }, { id: 2, occupied: false }]
        this.#usersInProgress = []
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
                            if (!usersWithNoThumbnails.length) return
                            usersWithNoThumbnails = usersWithNoThumbnails
                                .filter(user => !this.#usersInProgress.includes(user.id))
                            const worker = new Worker("./src/scripts/resizeImage.ts", {
                                workerData: { workerId: workerObj.id, usersWithNoThumbnails }
                            })
                            this.#usersInProgress.push(...usersWithNoThumbnails.map(user => user.id))
                            worker.on("message", this.updateWorkertatus.bind(this, workerObj.id, false))
                            worker.on("error", this.updateWorkertatus.bind(this, workerObj.id, false))
                            break
                        default: return
                    }
                    if (task) {
                        this.updateWorkertatus(workerObj.id, true)
                    }
                }
            }
        })
    }

    async updateWorkertatus(workerId: number, newOccupiedStatus: boolean, ...args: any) {
        this.#workers = this.#workers.map(workerObj => {
            if (workerObj.id === workerId) {
                return { ...workerObj, occupied: newOccupiedStatus }
            }
            return workerObj
        })
        if (!args.length) return
        const { task, thumbnails } = args[0].data
        switch (task) {
            case "generate-thumbnail":
                const usersCompleted = thumbnails.map((thumbnail: any) => thumbnail.userId)
                this.#usersInProgress = this.#usersInProgress
                    .filter(userInProgress => !usersCompleted.includes(userInProgress))

                for (const user of thumbnails) {
                    await dbInstance.update(
                        {
                            thumbnailImage: user.path
                        },
                        {
                            where: {
                                id: {
                                    [Op.is]: user.userId
                                }
                            }
                        }
                    )
                }
                break
            default: return
        }
    }

}

export default BackgroundTasksCron