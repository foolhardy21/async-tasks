import { NextFunction, Request, Response } from "express"
import { Op } from "sequelize"
import { promises } from "fs"
import dbInstance from "../services/database"

export async function userImgValidator(req: Request, res: Response, next: NextFunction) {
    const { file, body: { userId } } = (req as any)
    if (!file) return res.status(400).json({ success: false, message: "File is invalid." })
    try {
        const userDbRes = await dbInstance.get({
            where: {
                id: { [Op.is]: Number(userId) }
            },
            options: {}
        })
        if (userDbRes.length != 1) throw new Error("User Id is invalid.")
    } catch (err: any) {
        console.log("Error while fetching user:", userId, err)
        await deleteFile("src/assets/users/uploaded/" + file.filename)
        return res.status(400).json({ success: false, message: err?.message })
    }
    next()
}

async function deleteFile(filePath: string) {
    try {
        await promises.unlink(filePath)
    } catch (err) {
        console.log("Error while deleting the file:", filePath)
    }
}