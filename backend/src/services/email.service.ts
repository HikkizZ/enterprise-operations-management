import nodemailer from 'nodemailer';
import { configEnv } from '../config/configEnv.js';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

function createTransporter() {
    return nodemailer.createTransport({
        host: configEnv.email.host,
        port: configEnv.email.port,
        secure: false,
        auth: {
            user: configEnv.email.user,
            pass: configEnv.email.pass,
        },
    });
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: configEnv.email.from,
        to,
        subject,
        html,
    });
}