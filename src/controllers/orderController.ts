import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import kafka from "../services/utils/kafka";
import dbInstance from "../services/database";
import { INVENTORY_STATUS, ORDER_EXPIRE_LIMIT, PAYMENT_STATUS } from "../utils/common";

export async function createOrderController(req: Request, res: Response) {
    const { userId } = req.params
    const ipAddress = req.ip
    const { totalAmount, items, paymentMethodBin, deviceFingerprint } = req.body

    try {
        const orderId = uuidv4()
        const orderExpiry = new Date()
        orderExpiry.setMinutes(orderExpiry.getMinutes() + ORDER_EXPIRE_LIMIT)
        await dbInstance.createOrderService({
            orderId,
            paymentStatus: PAYMENT_STATUS.PENDING,
            inventoryStatus: INVENTORY_STATUS.PENDING,
            expiresAt: orderExpiry,
        })
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
        res.status(202).json({ success: true, message: "Order created successfully." })
    } catch (err) {
        console.log("Error creating order: ", userId)
        res.status(500).json({ success: false, message: err?.toString() })
    }
}