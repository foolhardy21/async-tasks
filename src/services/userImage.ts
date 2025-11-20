import { Op } from "sequelize"
import { Worker } from "worker_threads";
import dbInstance from "./database"

class UserImage {

    constructor() { }

    async handleImageUpload({ path, userId }: { path: string, userId: string }) {
        try {
            console.log("Updating user's record:", userId, path)
            await dbInstance.update(
                { uploadedImage: path },
                { where: { id: { [Op.is]: userId } } }
            )
            let usersWithNoThumbnails = await dbInstance.get({
                where: {
                    thumbnailImage: { [Op.is]: null },
                },
                options: {},
            }) || []
            if (!usersWithNoThumbnails.length) return

            const worker = new Worker("./src/scripts/resizeImage.ts", {
                workerData: { usersWithNoThumbnails }
            })
            worker.on("message", this.handlePostImgUpload.bind(this))
            worker.on("error", this.handlePostImgUpload.bind(this))
        } catch (err) {
            console.log("Error while uploading user image:", err)
        }
    }

    async handlePostImgUpload(data: any) {
        try {
            console.log(data.data.thumbnails)
            for (const thumbnail of data.data.thumbnails) {
                await dbInstance.update(
                    {
                        thumbnailImage: thumbnail.path
                    },
                    {
                        where: { id: { [Op.is]: thumbnail.userId } }
                    }
                )
                await this.handleLogUpload(thumbnail)
                await this.handleNotifyAdmin(thumbnail)
            }
        } catch (err) {
            console.log("Error while updating user's thumbnail:", err)
        }
    }

    async handleLogUpload(data: any) {
        try {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Logs uploaded for:", data)
                    resolve("")
                }, 1 * 1000)
            })
        } catch (err) {
            console.log("Error while upload log:", err)
        }
    }

    async handleNotifyAdmin(data: any) {
        try {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Admin notified about:", data)
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
