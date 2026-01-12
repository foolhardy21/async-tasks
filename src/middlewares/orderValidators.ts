import { NextFunction, Request, Response } from "express"
import { Op } from "sequelize"
import dbInstance from "../services/database"

export async function createOrderValidator(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params
    try {
        const userDbRes = await dbInstance.get({
            where: {
                id: { [Op.is]: Number(userId) }
            },
            options: {},
        })
        if (userDbRes.length != 1) {
            throw new Error("User Id is invalid.")
        } else {
            const payload = req.body
            const payloadValidKeys = ["totalAmount", "items", "paymentMethodBin", "deviceFingerprint"]
            for (const key of payloadValidKeys) {
                if (!payload?.[key]) {
                    throw new Error("Request payload is invalid")
                }
            }
        }
        next()
    } catch (err: any) {
        console.log("Error while validating order:", userId, err)
        return res.status(400).json({ success: false, message: err?.message })
    }
}
