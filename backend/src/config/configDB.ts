import { DataSource } from 'typeorm';
import { configEnv } from './configEnv.js';
import { User } from '../entity/user.entity.js';
import { Employee } from '../entity/rrhh/employee.entity.js';
import { EmployeeProfile } from '../entity/rrhh/employeeProfile.entity.js';
import { EmploymentHistory } from '../entity/rrhh/employmentHistory.entity.js';
import { Leave } from '../entity/rrhh/leave.entity.js';

/* Enviroment */
const isProduction = configEnv.nodeEnv === 'production';

/* En producción se usa el glob sobre los JS compilados; en dev/test se importan
 * las clases directamente para que el bundler/transform pueda procesarlas. */
const entities = isProduction
    ? ['dist/entity/**/*.js']
    : [User, Employee, EmployeeProfile, EmploymentHistory, Leave];

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
