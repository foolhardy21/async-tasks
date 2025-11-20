import { Request, Response } from "express";
import eventsManager from "../services/eventsManager";
import { EVENTS } from "../utils/eventsUtils";

export function userImgController(req: Request, res: Response) {
    const { file, body: { userId } } = req as any
    eventsManager.fire(EVENTS.IMAGE_UPLOAD, { path: "users/uploaded/" + file.filename, userId: userId })
    return res.status(202).json({ success: true, message: "Task accepted successfully." })
}