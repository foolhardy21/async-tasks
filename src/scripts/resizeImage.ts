const sharp = require("sharp")
const path = require("path")
const { promises } = require("fs")
const { workerData, parentPort } = require("worker_threads")

async function resizeUserImageForThumbnail() {
    let thumbnailsArr = []
    try {
        const { usersWithNoThumbnails } = workerData
        console.log("starting image resize script:", usersWithNoThumbnails)
        for (const user of usersWithNoThumbnails) {
            const inputPath = path.resolve(__dirname, "..", "assets", (user.uploadedImage || ""))
            const outputDir = path.resolve(__dirname, "..", "assets", "users", "thumbnail")
            const outputPath = path.join(outputDir, (user.uploadedImage || "").split("/")[2])

            try {
                await promises.access(inputPath)
            } catch (err) {
                console.log(err)
                continue
            }
            await promises.mkdir(outputDir, { recursive: true })
            await sharp(inputPath)
                .resize(300, 300)
                .toFile(outputPath)

            thumbnailsArr.push({ userId: user.id, path: outputPath.split("/assets/")[1] })
        }
        return {
            success: true,
            message: "Thumbnails generated successfully.",
            data: { task: "generate-thumbnail", thumbnails: thumbnailsArr }
        }
    } catch (err) {
        console.log(err)
        return {
            success: false,
            message: err,
            data: { task: "generate-thumbnail", thumbnails: thumbnailsArr }
        }
    }
}

resizeUserImageForThumbnail()
    .then(result => {
        parentPort?.postMessage(result)
    })