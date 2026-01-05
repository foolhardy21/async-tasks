import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import kafka from "../services/utils/kafka";

export async function createOrderController(req: Request, res: Response) {
    const { userId } = req.params
    const ipAddress = req.ip
    const { totalAmount, items, paymentMethodBin, deviceFingerprint } = req.body

    try {
        const orderId = uuidv4()
        await kafka.produce("order.created", [{
            value: JSON.stringify({
                event_type: "OrderPlaced",
                event_version: 2,
                order_id: orderId,
                user_id: userId,
                total_amount: totalAmount,
                items: items,
                device_fingerprint: deviceFingerprint,
                ip_address: ipAddress,
                payment_method_bin: paymentMethodBin,
            })
        }])
        res.status(201).json({ success: true, message: "Order created successfully." })
    } catch (err) {
        console.log("Error creating order: ", userId)
        res.status(500).json({ success: false, message: err?.toString() })
    }

}