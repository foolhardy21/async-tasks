import { Op } from "sequelize"
import sharp from "sharp"
import path from "path"
import { promises as fs } from "fs"
import dbInstance from "../services/database"

async function resizeUserImageForThumbnail() {
    try {
        console.log("starting image resize script")
        const usersWithNoThumbnails = await dbInstance.get({
            where: {
                thumbnailImage: {
                    [Op.is]: null,
                },
            },
            options: {},
        }) || []
        console.log(usersWithNoThumbnails)
        for (const user of usersWithNoThumbnails) {
            const inputPath = path.resolve(__dirname, "..", "assets", (user.uploadedImage || ""))
            const outputDir = path.resolve(__dirname, "..", "assets", "users", "thumbnail")
            const outputPath = path.join(outputDir, (user.uploadedImage || "").split("/")[2])

            try {
                await fs.access(inputPath)
            } catch (err) {
                console.log(err)
                continue
            }
            await fs.mkdir(outputDir, { recursive: true })
            await sharp(inputPath)
                .resize(300, 300)
                .toFile(outputPath)

            await dbInstance.update(
                {
                    thumbnailImage: outputPath.split("/assets/")[1]
                },
                {
                    where: {
                        id: {
                            [Op.is]: user.id
                        }
                    }
                }
            )

        }
    } catch (err) {
        console.log(err)
    }
}

export default resizeUserImageForThumbnail