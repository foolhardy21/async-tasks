import { Op } from "sequelize";
import { Request, Response } from "express";
import { EVENT_TASKS_MAP, EVENTS } from "../utils/eventsUtils";
import dbInstance from "../services/database";
import eventsManager from "../services/eventsManager";
import { sendAnalytics } from "../services/analytics";
import { queueManager } from "../services/queueManager";
import { TASK_EXECUTION_TYPES } from "../utils/common";

export function userImgController(req: Request, res: Response) {
    const { file, body: { userId, executionType = "" } } = req as any
    if (executionType === TASK_EXECUTION_TYPES.QUEUE) {
        queueManager.enqueue({ type: EVENTS.IMAGE_UPLOAD, data: { path: "users/uploaded/" + file.filename, userId: userId } })
    } else {
        setTimeout(() => {
            eventsManager.fire(EVENTS.IMAGE_UPLOAD, { path: "users/uploaded/" + file.filename, userId: userId })
        }, 0 * 1000)
    }
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

        if (userDbRes.thumbnailImage) {
            return res.status(200).json({
                success: false,
                message: "Thumbnail generated successfully.",
                data: { status: "done", url: userDbRes.thumbnailImage }
            })
        } else {
            eventsManager.subscribe(EVENT_TASKS_MAP[EVENTS.IMAGE_UPLOAD][0], (thumbnailImage: string) => {
                sendAnalytics("Thumbnail Generation", {
                    thumbnail_image: thumbnailImage,
                    user_id: userId,
                })
                return res.status(200).json({
                    success: false,
                    message: "Thumbnail generated successfully.",
                    data: { status: "done", url: thumbnailImage }
                })
            })
        }

    } catch (err) {
        console.log("Error while returning the thumbnail status:", err)
    }
}