import { NextFunction, Request, Response } from "express"
import { Op } from "sequelize"
import dbInstance from "../services/database"
import { deleteFile } from "../utils/common"

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

export async function thumbnailStatusValidator(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params
        const userDbRes = await dbInstance.get({
            where: {
                id: { [Op.is]: Number(userId) }
            },
            options: {},
        })
        if (userDbRes.length != 1) throw new Error("User Id is invalid.")
        next()
    } catch (err: any) {
        console.log("Error while validating thumbnail status:", err)
        return res.status(500).json({ success: false, message: err?.message })
    }
}