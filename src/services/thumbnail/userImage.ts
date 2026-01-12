import { Op } from "sequelize"
import { Worker } from "worker_threads";
import dbInstance from "../database"
import { EVENT_TASKS_MAP, EVENTS } from "../../utils/eventsUtils";
import eventsManager from "../utils/eventsManager";

class UserImage {
    #usersThumbnailData: Array<{ userId: number, path: string }>

    constructor() {
        this.#usersThumbnailData = []
    }

    async handleImageUpload({ path, userId }: { path: string, userId: string }) {
        try {
            for (let i = 0; i < EVENT_TASKS_MAP[EVENTS.IMAGE_UPLOAD].length; i++) {
                const task = EVENT_TASKS_MAP[EVENTS.IMAGE_UPLOAD][i]
                switch (task) {
                    case "generate-thumbnail":
                        console.log("Updating user's record:", userId, path)
                        await dbInstance.update(
                            { uploadedImage: path },
                            { where: { id: { [Op.is]: userId } } }
                        )
                        const userWithUploadedImg = await dbInstance.get({
                            where: {
                                id: { [Op.is]: userId },
                            },
                            options: {},
                        }) || []

                        const worker = new Worker("./src/scripts/resizeImage.ts", {
                            workerData: { usersWithNoThumbnails: userWithUploadedImg }
                        })
                        worker.on("message", this.handlePostImgUpload.bind(this))
                        worker.on("error", this.handlePostImgUpload.bind(this))
                        break
                    case "log-upload":
                        this.handleLogUpload()
                        break
                    case "notify-admin":
                        this.handleNotifyAdmin()
                        break
                    default: return
                }
            }
        } catch (err) {
            console.log("Error while uploading user image:", err)
            throw err
        }
    }

    async handlePostImgUpload(data: any) {
        try {
            this.#usersThumbnailData = data.data
            for (const thumbnail of data.data.thumbnails) {
                await dbInstance.update(
                    {
                        thumbnailImage: thumbnail.path
                    },
                    {
                        where: { id: { [Op.is]: thumbnail.userId } }
                    }
                )
                try {
                    eventsManager.fire(EVENT_TASKS_MAP[EVENTS.IMAGE_UPLOAD][0], thumbnail.path)
                } catch (err) {
                    console.log(err)
                }
            }
        } catch (err) {
            console.log("Error while updating user's thumbnail:", err)
            throw err
        }
    }

    async handleLogUpload() {
        try {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Logs uploaded for:", this.#usersThumbnailData)
                    resolve("")
                }, 1 * 1000)
            })
        } catch (err) {
            console.log("Error while upload log:", err)
        }
    }

    async handleNotifyAdmin() {
        try {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Admin notified about:", this.#usersThumbnailData)
                    resolve("")
                }, 2 * 1000)
            })
        } catch (err) {
            console.log("Error while upload log:", err)
        }
    }
}

const userImgServiceInstance = new UserImage()

export default userImgServiceInstance
