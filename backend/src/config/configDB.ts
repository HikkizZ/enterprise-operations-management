import { DataSource } from 'typeorm';
import { configEnv } from './configEnv.js';

/* Enviroment */
const isProduction = configEnv.nodeEnv === 'production';
const isTest = configEnv.nodeEnv === 'test';

/* Dynamic route for the entities according to the environment */
const entitiesPath = isProduction
    ? 'dist/entity/**/*.js' // production
    : 'src/entity/**/*.ts'; // development and test

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: configEnv.database.host,
    port: configEnv.database.port,

    username: configEnv.database.username,
    password: configEnv.database.password,
    database: configEnv.database.name,

    synchronize: true,
    logging: ['error', 'warn'],

    entities: [entitiesPath],
    migrations: [],
    subscribers: [],

    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export const initializeDB = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connected successfully');
        }
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
        throw error;
    }
}
