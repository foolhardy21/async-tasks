import dotenv from "dotenv"
import { Resend } from "resend"
import { failedImageResizeTasksMail } from "../utils/templates"
import { QueueTask } from "./queueManager"

dotenv.config()

class EmailService {
    #resend
    constructor() {
        this.#resend = new Resend(process.env.RESEND_API_KEY)
    }

    async send({ toEmail, subject, body }: { toEmail: Array<string>, subject: string, body: string }) {
        try {
            if (process.env.RESEND_FROM_EMAIL) {
                const { error } = await this.#resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL,
                    to: toEmail,
                    subject,
                    html: body,
                })
                if (error) throw new Error(error.message)
            }
        } catch (err) {
            console.log("Error sending the mail: ", err)
            throw err
        }
    }
}
class EmailSender {
    #emailService
    constructor(emailService: EmailService) {
        this.#emailService = emailService
    }

    async sendFailedImageResizeTasksMail({ to, tasks }: { to: Array<string>, tasks: Array<QueueTask | undefined> }) {
        try {
            const { subject, body } = failedImageResizeTasksMail(tasks)
            await this.#emailService.send({
                toEmail: to,
                subject,
                body,
            })
        } catch (err) {
            console.log("Error sending failed tasks mail: ", err)
            throw err
        }
    }
}
const emailService = new EmailService()
const emailSender = new EmailSender(emailService)

export default emailSender