import { NextFunction, Request, Response } from "express"
import { sendAnalytics } from "../services/analytics"

export function logger(req: Request, _: Response, next: NextFunction) {
    try {
        const { originalUrl, method, ip, headers } = req
        let payload, userAgent
        if (method === "POST") {
            payload = req.body
        }
        userAgent = headers["user-agent"]
        sendAnalytics("Request Meta Info", {
            method,
            original_url: originalUrl,
            user_agent: userAgent,
            ip,
            ...(payload && { body: payload })
        })
        next()
    } catch (err) {
        console.log("Error while logging:", err)
    }
}

export function requestTimer(req: Request, res: Response, next: NextFunction) {
    try {
        const startTime = Date.now()
        const originalSendFn = res.send
        res.send = function (...args) {
            const { method, originalUrl } = req
            const elapsedTime = Date.now() - startTime
            sendAnalytics("Request Time", {
                method,
                original_url: originalUrl,
                elapsed_time: elapsedTime,
            })
            return originalSendFn.apply(res, ...args)
        }
        next()
    } catch (err) {
        console.log("Error while timing the request:", err)
    }
}