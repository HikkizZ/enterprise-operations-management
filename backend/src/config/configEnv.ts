import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the current directory path

const __envPath = path.resolve(__dirname, '../../.env'); // Resolve the .env file path

dotenv.config({ path: __envPath }); // Load environment variables from .env file

export const configEnv = {
    nodeEnv: process.env.NODE_ENV ?? 'development',

    server: {
        host: process.env.HOST ?? 'localhost',
        port: Number(process.env.PORT ?? 3000),
    },

    database: {
        name: process.env.DATABASE!,
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        port: Number(process.env.DB_PORT ?? 5432),
        host: process.env.DB_HOST ?? 'localhost',
    },

    auth: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
        cookieKey: process.env.COOKIE_KEY!,
        superAdmin: {
            name: process.env.SUPER_ADMIN_NAME!,
            email: process.env.SUPER_ADMIN_EMAIL!,
            password: process.env.SUPER_ADMIN_PASSWORD!,
        }
    },

    domains: {
        allowedEmailDomains: process.env.ALLOWED_EMAIL_DOMAINS ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map(domain => domain.trim()) : [],
        allowedCorporateEmailDomains: process.env.ALLOWED_CORPORATE_EMAIL_DOMAINS ? process.env.ALLOWED_CORPORATE_EMAIL_DOMAINS.split(',').map(domain => domain.trim()) : [],
    },

    company: {
        emailDomain: process.env.COMPANY_EMAIL_DOMAIN ?? 'company.com',
    },

    email: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT ?? 587),
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
        from: process.env.SMTP_FROM ?? 'EOMS <no-reply@company.com>',
    },

    storage: {
        uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
    },
};