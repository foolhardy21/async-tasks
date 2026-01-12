import { promises } from "fs"

export async function deleteFile(filePath: string) {
    try {
        await promises.unlink(filePath)
    } catch (err) {
        console.log("Error while deleting the file:", filePath)
    }
}

export const TASK_EXECUTION_TYPES = {
    QUEUE: "queue",
    PUBSUB: "pub-sub",
}

export const PAYMENT_STATUS = {
    PENDING: "pending",
    AUTHORIZED: "authorized",
    FAILED: "failed",
}

export const INVENTORY_STATUS = {
    PENDING: "pending",
    RESERVED: "reserved",
    OUT_OF_STOCK: "out_of_stock",
    FAILED: "failed",
}

export const ORDER_EXPIRE_LIMIT = 1