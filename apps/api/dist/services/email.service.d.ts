export declare class EmailService {
    private readonly transporter;
    sendDailyAlert(to: string, subject: string, html: string): Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
}
