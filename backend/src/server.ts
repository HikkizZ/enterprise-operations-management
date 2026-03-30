import 'reflect-metadata'; // Required for TypeORM

import express, { json, urlencoded } from 'express';
import type { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import indexRoutes from './routes/index.routes.js';
import { initializeDB } from './config/configDB.js';
import { initialSetup } from './utils/initialSetup.js';
import { configEnv } from './config/configEnv.js';
import { registerPassportJWTStrategy } from './auth/passport.auth.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

/* Exportar la aplicación y servidor de pruebas */
let server: any;

/* Determinar el entorno */
const isProduction = configEnv.nodeEnv === 'production';
const isTest = configEnv.nodeEnv === 'test';
const isDevelopment = !isProduction && !isTest;

export function createApp() {
    const app: Application = express();

    /* Config server */
    app.disable('x-powered-by');

    app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }));

    app.use(urlencoded({
        extended: true,
        limit: '1mb'
    }));

    app.use(json({
        limit: '1mb'
    }));

    app.use(cookieParser());

    if (isDevelopment) app.use(morgan('dev'));

    registerPassportJWTStrategy();
    app.use(passport.initialize());

    app.use((_req, res, next) => {
        if (!res.getHeader('Content-Disposition')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        next();
    });

    app.use('/api', indexRoutes);

    app.use(errorHandler);
    return app;
}
async function setupServer() {
    try {
        console.log('🔧 Setting up server...');

        /* Initialize Database */
        await initializeDB();
        await initialSetup();

        /* Create Express App */
        const app = createApp();

        server = app.listen(configEnv.server.port, () => {
            console.log('✅ Server started successfully');
            console.log(`✅ Server running on http://${configEnv.server.host}:${configEnv.server.port}/api`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
    }
}

export async function setupTestServer(): Promise<{ app: Application; server: any }> {
    try {
        console.log("🔧 Setting up test server...");

        /* Initialize Database */
        await initializeDB();

        /* Create Express App */
        const app = createApp();

        server = app.listen(0); // Usar puerto aleatorio para pruebas
        console.log("✅ Test server running. DB connected, initial setup done.");

        return { app, server };
    } catch (error) {
        console.error("❌ Error starting the test server: -> setupTestServer(). Error: ", error);
        throw error;
    }
}

if (!isTest) {
    setupServer();
} else {
    console.log('⚠️ Test environment detected. Server not started.');
}