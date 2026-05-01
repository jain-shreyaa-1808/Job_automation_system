import nodemailer from "nodemailer";
import { env } from "../config/env.js";
export class EmailService {
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false,
        auth: env.SMTP_USER
            ? {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            }
            : undefined,
    });
    async sendDailyAlert(to, subject, html) {
        return this.transporter.sendMail({
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
        });
    }
}
//# sourceMappingURL=email.service.js.map