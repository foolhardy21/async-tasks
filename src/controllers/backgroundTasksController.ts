import { Request, Response } from "express";
import backgroundTasks from "../utils/backgroundTasksUtils";

export function backgroundTaskController(req: Request, res: Response) {
    const task = req.body.task
    backgroundTasks.enqueue(task)
    return res.status(202).json({ success: true, message: "Task accepted successfully" })
}