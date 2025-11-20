import { promises } from "fs"

export async function deleteFile(filePath: string) {
    try {
        await promises.unlink(filePath)
    } catch (err) {
        console.log("Error while deleting the file:", filePath)
    }
}