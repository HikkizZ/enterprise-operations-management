import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { encryptPassword } from "./encrypt.js";
import { configEnv } from "../config/configEnv.js";
import { userRoles } from "../types/user.types.js";

export async function initialSetup(): Promise<void> {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const existingSuperAdmin = await userRepository.findOne({ 
            where: { role: userRoles.SUPER_ADMINISTRADOR },
         });

         if (!existingSuperAdmin) {
            const superAdmin = userRepository.create({
                name: configEnv.auth.superAdmin.name,
                corporateEmail: configEnv.auth.superAdmin.email,
                password: await encryptPassword(configEnv.auth.superAdmin.password),
                role: userRoles.SUPER_ADMINISTRADOR,
                rut: null,
                accountStatus: 'Activa',
            });

            await userRepository.save(superAdmin);
            console.log('🔑 Super Administrador creado exitosamente');
         } else {
            console.log('ℹ️ Super Administrador ya existe, no se creó uno nuevo');
         }
    } catch (error) {
        console.error('❌ Error en initialSetup:', error);
        throw error;
    }
}