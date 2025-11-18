import { NextFunction, Request, Response } from "express";
import { ALLOWED_BACKGROUND_TASKS } from "../utils/backgroundTasksUtils";

export function backgroundTaskValidator(req: Request, res: Response, next: NextFunction) {
    const task = req.body.task || ""
    if (ALLOWED_BACKGROUND_TASKS.has(task)) {
        next()
    } else {
        return res.status(400).json({ success: false, message: "This operation is not allowed." })
    }
}