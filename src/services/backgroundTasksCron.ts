import cron from "node-cron";
import backgroundTasks from "../utils/backgroundTasksUtils";
import resizeUserImageForThumbnail from "../scripts/resizeImage";

class BackgroundTasksCron {
    constructor() { }

    start() {
        cron.schedule("* * * * *", () => {
            const task = backgroundTasks.dequeue()
            console.log("cron running", task)
            switch (task) {
                case "generate-thumbnail":
                    resizeUserImageForThumbnail()
                    break
                default: return
            }
        })
    }
}

export default BackgroundTasksCron