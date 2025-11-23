import WebSocket from "ws"
import dotenv from "dotenv"
import express from "express"
import tasksRouter from "./src/routes/tasksRoutes"
import { EVENTS } from "./src/utils/eventsUtils"
import userImgServiceInstance from "./src/services/userImage"
import eventsManager from "./src/services/eventsManager"
import { GAME_DETAILS, LEADERBOARD_STANDINGS } from "./src/utils/leaderboardUtils"

dotenv.config()

const app = express()
const wss = new WebSocket.Server({ port: Number(process.env.WS_PORT) })

app.use(express.json())
app.use("/api/tasks", tasksRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
    eventsManager.subscribe(EVENTS.IMAGE_UPLOAD, userImgServiceInstance.handleImageUpload.bind(userImgServiceInstance))
})

wss.on("connection", function (ws) {
    ws.on("message", function (data: string) {
        const { type } = JSON.parse(data)
        switch (type) {
            case "leaderboard.latest":
                ws.send(JSON.stringify({
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