import multer, { FileFilterCallback } from "multer"
import { Request, Router } from "express"
import { userImgValidator } from "../validators/userImgValidators"
import { userImgController } from "../controllers/userImgController"

const tasksrouter = Router()

const storage = multer.diskStorage({
    destination: function (_, __, cb) {
        cb(null, "src/assets/users/uploaded/")
    },
    filename: function (_, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg")
    },
})
const fileFilter = function (_: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const allowedTypes = ["image/jpeg"]
    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    cb(null, false)
}
const fileUpload = multer({ storage, fileFilter })

tasksrouter.post("/upload-image", fileUpload.single("file"), userImgValidator, userImgController)

export default tasksrouter