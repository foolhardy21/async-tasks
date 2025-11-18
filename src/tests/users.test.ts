import supertest from "supertest"
import backgroundTasks from "../utils/backgroundTasksUtils"
import app from "../.."

describe("Users Integration Testing", () => {
    const body = {
        task: "generate-thumbnail"
    }

    it("should keep running the tasks queue", async () => {
        const isQueueEmpty = backgroundTasks.isEmpty()
        expect(isQueueEmpty).toBeTruthy()

        const response = await supertest(app)
            .post("/api/background-task/enqueue")
            .send(body)

        expect(response.status).toBe(202)

        const isQueueEmptyAfterEnqueue = backgroundTasks.isEmpty()
        expect(isQueueEmptyAfterEnqueue).toBeFalsy()

    })
})