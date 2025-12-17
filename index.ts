import dotenv from "dotenv"
import express from "express"
import http from "http"
import { Server } from "socket.io"
import tasksRouter from "./src/routes/tasksRoutes"
import { EVENTS } from "./src/utils/eventsUtils"
import userImgServiceInstance from "./src/services/userImage"
import eventsManager from "./src/services/eventsManager"
import { GAME_DETAILS, LEADERBOARD_STANDINGS } from "./src/utils/leaderboardUtils"
import { logger, requestTimer } from "./src/middlewares/common"
import leaderboardRouter from "./src/routes/leaderboard"
import backgroundTasks from "./src/services/backgroundTasks"

dotenv.config()

const app = express()
const server = http.createServer(app)
const socketServer = new Server(server)

app.use(express.json())
app.use(logger)
app.use(requestTimer)
app.use("/api/tasks", tasksRouter)
app.use("/server-events", leaderboardRouter)

server.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
    eventsManager.subscribe(EVENTS.IMAGE_UPLOAD, userImgServiceInstance.handleImageUpload.bind(userImgServiceInstance))
    backgroundTasks.start()
})

socketServer.on("connection", function (socket) {
    socket.on("message", function (data: string) {
        const { type } = JSON.parse(data)
        switch (type) {
            case "leaderboard.latest":
                socket.send(JSON.stringify({
                    type,
                    payload: {
                        game: { ...GAME_DETAILS },
                        standings: [...LEADERBOARD_STANDINGS],
                    }
                }))
                break
            default: return
        }
    })
})

export default app