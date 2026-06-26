import { DataSource } from 'typeorm';
import { configEnv } from './configEnv.js';
import { ENTITIES } from '../entity/index.js';

/* Enviroment */
const isProduction = configEnv.nodeEnv === 'production';

/* En producción se usa el glob sobre los JS compilados; en dev/test se usa el
 * array explícito para garantizar referencias únicas de clase (requerido por TypeORM). */
const entities = isProduction
    ? ['dist/entity/**/*.js']
    : [...ENTITIES];

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: configEnv.database.host,
    port: configEnv.database.port,

    username: configEnv.database.username,
    password: configEnv.database.password,
    database: configEnv.database.name,

    synchronize: true,
    logging: ['error', 'warn'],

    entities,
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
