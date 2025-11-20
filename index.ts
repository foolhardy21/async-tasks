import dotenv from "dotenv"
import express from "express"
import tasksRouter from "./src/routes/tasksRoutes"
import { EVENTS } from "./src/utils/eventsUtils"
import userImgServiceInstance from "./src/services/userImage"
import eventsManager from "./src/services/eventsManager"

dotenv.config()

const app = express()

app.use(express.json())
app.use("/api/tasks", tasksRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
    eventsManager.subscribe(EVENTS.IMAGE_UPLOAD, userImgServiceInstance.handleImageUpload.bind(userImgServiceInstance))
})

export default app