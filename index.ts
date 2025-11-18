import dotenv from "dotenv"
import express from "express"
import BackgroundTasksCron from "./src/services/backgroundTasksCron"
import backgroundTasksRouter from "./src/routes/backgroundTasksRoutes"

dotenv.config()

const app = express()

app.use(express.json())
app.use("/api/background-task", backgroundTasksRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
    new BackgroundTasksCron().start()
})

export default app