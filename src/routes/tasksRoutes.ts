import multer, { FileFilterCallback } from "multer"
import { Request, Router } from "express"
import { thumbnailStatusValidator, userImgValidator } from "../middlewares/userImgValidators"
import { thumbnailStatusController, userImgController } from "../controllers/userImgController"
import { createOrderController } from "../controllers/orderController"
import { createOrderValidator } from "../middlewares/orderValidators"

const tasksrouter = Router()

const storage = multer.diskStorage({
    destination: function (_, __, cb) {
        cb(null, "src/assets/users/uploaded/")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + req.params.userId + ".jpg")
    },
})
const fileFilter = function (_: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const allowedTypes = ["image/jpeg"]
    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    cb(null, false)
}
const fileUpload = multer({ storage, fileFilter })

tasksrouter.post("/upload-image/:userId", fileUpload.single("file"), userImgValidator, userImgController)
tasksrouter.get("/thumbnail-status/:userId", thumbnailStatusValidator, thumbnailStatusController)
tasksrouter.post("/order/:userId", createOrderValidator, createOrderController)

export default tasksrouter