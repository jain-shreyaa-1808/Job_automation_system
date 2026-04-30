import nodemailer from "nodemailer";

import { env } from "../config/env.js";

export class EmailService {
  private readonly transporter = nodemailer.createTransport({
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

  async sendDailyAlert(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
}
