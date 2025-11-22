import { Op } from "sequelize";
import { Request, Response } from "express";
import { EVENTS } from "../utils/eventsUtils";
import dbInstance from "../services/database";
import eventsManager from "../services/eventsManager";

export function userImgController(req: Request, res: Response) {
    const { file, body: { userId } } = req as any
    setTimeout(() => {
        eventsManager.fire(EVENTS.IMAGE_UPLOAD, { path: "users/uploaded/" + file.filename, userId: userId })
    }, 0 * 1000)
    return res.status(202).json({ success: true, message: "Task accepted successfully." })
}

export async function thumbnailStatusController(req: Request, res: Response) {
    try {
        const { userId } = req.params
        const [userDbRes] = await dbInstance.get({
            where: {
                id: { [Op.is]: userId }
            },
            options: {},
        })
        const message = userDbRes.thumbnailImage ? "Thumbnail generated successfully." : "Thumbnail generation is pending."
        const data = userDbRes.thumbnailImage ? { status: "done", url: userDbRes.thumbnailImage } : { status: "pending" }

        return res.status(200).json({ success: false, message, data })
    } catch (err) {
        console.log("Error while returning the thumbnail status:", err)
    }
}