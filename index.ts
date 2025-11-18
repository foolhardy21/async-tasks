import dotenv from "dotenv"
import express from "express"
import cron from "node-cron"
import resizeUserImageForThumbnail from "./src/scripts/resizeImage"

dotenv.config()

const app = express()

app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
})

cron.schedule("* * * * *", () => {
    resizeUserImageForThumbnail()
})

export default app