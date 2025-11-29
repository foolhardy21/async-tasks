import { Request, Response, Router } from "express"
import { GAME_DETAILS, LEADERBOARD_STANDINGS } from "../utils/leaderboardUtils"

const leaderboardRouter = Router()

leaderboardRouter.get("/", function (_: Request, res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Connection", "keep-alive")

    res.flushHeaders()

    setInterval(() => {
        res.write(`data: ${JSON.stringify({
            game: { ...GAME_DETAILS },
            standings: [...LEADERBOARD_STANDINGS],
        })}`)
    }, 10 * 1000)
})

export default leaderboardRouter