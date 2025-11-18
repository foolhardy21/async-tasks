import { Router } from "express"
import { backgroundTaskValidator } from "../validators/backgroundTasksValidators"
import { backgroundTaskController } from "../controllers/backgroundTasksController"

const backgroundTasksrouter = Router()

backgroundTasksrouter.post("/enqueue", backgroundTaskValidator, backgroundTaskController)

export default backgroundTasksrouter