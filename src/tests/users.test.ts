import supertest from "supertest"
import path from "path"
import dbInstance from "../services/database"
import app from "../.."

describe("Users Integration Testing", () => {

    it("Long polling: should return the thumbnail status", async () => {
        const user = await dbInstance.create({ uploadedImage: "", thumbnailImage: "" })
        const userId = user.id
        const fixture = path.join(__dirname, "fixtures", "user6.jpg")

        setTimeout(async () => {
            await supertest(app)
                .post("/api/tasks/upload-image")
                .field("userId", userId)
                .attach("file", fixture)
        }, 5 * 1000)

        const statusRes = await supertest(app)
            .get("/api/tasks/thumbnail-status" + "/" + userId)
        expect(statusRes.status).toBe(200)
        expect(statusRes.body.data.status).toBe("done")

    })
})