import { User } from '../entity/user.entity.js';
import { AppDataSource } from '../config/configDB.js';
import { encryptPassword, comparePassword } from '../utils/encrypt.js';
import { userRoles } from '../types/user.types.js';
import type { UserQueryParams, UpdateUserData, UserRole, SafeUser } from '../types/user.types.js';
import type { ServiceResponse } from '../types/common.types.js';
import { Not, ILike } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { isValidRut, cleanRut } from 'rut-kit';

/* Validar formato de corporateEmail */
function isValidCorporateEmail(corporateEmail: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(corporateEmail);
}

/* Validar rol de usuario */
function isValidRole(role: string): role is UserRole {
    return (userRoles as readonly string[]).includes(role);
}

/* Buscar usuarios con filtro */
export async function getUsersService(query: UserQueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        if (query.rut && !isValidRut(query.rut)) {
            return { ok: false, error: { message: 'RUT inválido' } };
        }

        if (query.corporateEmail && !isValidCorporateEmail(query.corporateEmail)) {
            return { ok: false, error: { message: 'Correo corporativo inválido' } };
        }

        const userRepository = AppDataSource.getRepository(User);

        if (query.rut) {
            const cleanRutValue = cleanRut(query.rut);

            const users = await userRepository.createQueryBuilder('user')
                .where(`REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut`, { cleanRut: cleanRutValue })
                .andWhere("user.role != :superAdminRole", { superAdminRole: 'SuperAdministrador' })
                .getMany();

            if (!users.length) {
                return { ok: true, data: [] };
            }

            const usersData: SafeUser[] = users.map(({ password: _p, ...user }) => user);
            return { ok: true, data: usersData };
        }

        const whereClause: FindOptionsWhere<User> = { role: Not('SuperAdministrador') };

        if (query.id) {
            whereClause.id = query.id;
        }

        if (query.corporateEmail) {
            whereClause.corporateEmail = ILike(`%${query.corporateEmail}%`);
        }

        if (query.name) {
            whereClause.name = ILike(`%${query.name}%`);
        }

        if (query.role) {
            if (!isValidRole(query.role)) {
                return { ok: false, error: { message: 'Rol de usuario inválido' } };
            }
            whereClause.role = query.role;
        }

        const users = await userRepository.find({ 
            where: whereClause,
            order: { createdAt: 'DESC' } 
        });

        if (!users || users.length === 0) {
            return { ok: true, data: [] };
        }

        const usersData: SafeUser[] = users.map(({ password: _p, ...user }) => user);
        return { ok: true, data: usersData };
    } catch (error) {
        console.error('Error en getUsersService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Actualizar datos de usuario */

/* Función auxiliar para limpiar data de actualización */
function sanitizeUserTextFields(data: UpdateUserData): UpdateUserData {
    const out: UpdateUserData = {};

    if (data.name !== undefined) {
        const v = data.name.trim().replace(/\s+/g, ' ');
        if (v.length > 0) out.name = v;
    }

    if (data.corporateEmail !== undefined) {
        const v = data.corporateEmail.trim();
        if (v.length > 0) out.corporateEmail = v;
    }

    if (data.rut !== undefined) {
        const v = data.rut.trim();
        if (v.length > 0) out.rut = v;
    }

    /* Copiar otros campos que no requieran limpieza */
    if (data.role !== undefined) out.role = data.role;
    if (data.accountStatus !== undefined) out.accountStatus = data.accountStatus;
    if (data.password !== undefined) out.password = data.password;

    return out;
}

export const updateUserService = async (
    query: {id?: string, rut?: string, corporateEmail?: string},
    body: UpdateUserData, requester: User
    ): Promise<User | null> => {
    try {
        /* Validar que se utilice 'role' y no 'rol' */
        if (Object.prototype.hasOwnProperty.call(body, 'rol')) {
            throw { status: 400, message: "El campo 'rol' no es válido. Utilice 'role' en su lugar." };
        }

        const cleanedBody = sanitizeUserTextFields(body);

        const userRepository = AppDataSource.getRepository(User);

        let user: User | null = null;

        /* Buscar usuario por id, rut o correo corporativo */
        if (query.id) {
            user = await userRepository.findOneBy({ id: query.id });
        } else if (query.rut) {
            const cleanRutValue = cleanRut(query.rut);
            user = await userRepository
                .createQueryBuilder('user')
                .where(`REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut`, { cleanRut: cleanRutValue })
                .getOne();
        } else if (query.corporateEmail) {
            user = await userRepository.findOneBy({ corporateEmail: query.corporateEmail });
        }

        if (!user) return null;

        if (user.role === 'SuperAdministrador') {
            throw { status: 403, message: 'No tiene permiso para modificar este usuario.' };
        }

        /* Permisos */
        const isSelf = requester.id === user.id;
        const allowedRoles = ['SuperAdministrador', 'Administrador', 'RecursosHumanos'];

        /* Si es el propio usuario, solo puede modificar su password */
        if (isSelf) {
            const keys = Object.keys(cleanedBody);
        
            if (!cleanedBody.password || keys.length !== 1) {
                throw { status: 403, message: 'No tiene permiso para modificar estos datos.' };
            }
        } else {
            /* Si no es el propio usuario, debe tener un rol permitido */
            if (!allowedRoles.includes(requester.role)) {
                throw { status: 403, message: 'No tienes permiso para modificar este usuario.' };
            }
        }

        /* No puede cambiar su propio rol */
        if (isSelf && cleanedBody.role) {
            throw { status: 403, message: 'No tiene permiso para modificar su propio rol.' };
        }

        /* No se puede cambiar a SuperAdministrador */
        if (cleanedBody.role === 'SuperAdministrador') {
            throw { status: 403, message: 'No se puede cambiar un usuario a SuperAdministrador.' };
        }

        /* Solo se permite cambiar password y/o role (según permisos) */
        const updateData: Partial<User> = {};

        if (cleanedBody.password) {
            updateData.password = await encryptPassword(cleanedBody.password);
        }

        if (cleanedBody.role && !isSelf) {
            updateData.role = cleanedBody.role;
        }

        userRepository.merge(user, updateData);
        const updatedUser = await userRepository.save(user);

        return updatedUser;
    } catch (error) {
        console.error('Error en updateUserService:', error);
        throw error;
    }
};

function sanitizeProfile(data: { name?: string; corporateEmail?: string }) {
    const out: { name?: string; corporateEmail?: string } = {};

    if (data.name !== undefined) {
        const v = data.name.trim().replace(/\s+/g, ' ');
        if (v.length > 0) out.name = v;
    }

    if (data.corporateEmail !== undefined) {
        const v = data.corporateEmail.trim();
        if (v.length > 0) out.corporateEmail = v;
    }

    return out;
}

/* Actualizar perfil de usuario */
export const updateOwnProfileService = async (
    requester: User,
    body: { name?: string, corporateEmail?: string }
    ): Promise<User | null> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        
        const cleanedBody = sanitizeProfile(body);

        const user = await userRepository.findOneBy({ id: requester.id });
        if (!user) return null;

        /* Solo permitir actualiazr name y corporateEmail */
        const dataUserUpdate: Partial<User> = {};

        if( cleanedBody.name ) dataUserUpdate.name = cleanedBody.name;

        if( cleanedBody.corporateEmail) {
            if (!isValidCorporateEmail(cleanedBody.corporateEmail)) {
                throw { status: 400, message: 'Correo corporativo inválido' };
            } 
        
            const existingUser = await userRepository.findOneBy({ corporateEmail: cleanedBody.corporateEmail });

            if (existingUser && existingUser.id !== user.id) {
                throw { status: 409, message: 'El correo corporativo ya está en uso' };
            }

            dataUserUpdate.corporateEmail = cleanedBody.corporateEmail;
        }

        if (Object.keys(dataUserUpdate).length === 0) return user; // No hay cambios

        userRepository.merge(user, dataUserUpdate);
        const updatedUser = await userRepository.save(user);
        return updatedUser;
    } catch (error) {
        console.error('Error en updateOwnProfileService:', error);
        throw error;
    }
}

/* Cambiar contraseña propia del usuario */
export const changeOwnPasswordService = async (requester: User, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({ id: requester.id });
        if (!user) return false;

        /* Verificar que la nueva contraseña sea diferente a la actual */
        if (currentPassword === newPassword) return false;

        /* Verificar contraseña actual */
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) return false;

        /* Encriptar nueva contraseña */
        const hashedNewPassword = await encryptPassword(newPassword);

        /* Actualizar contraseña */
        user.password = hashedNewPassword;
        await userRepository.save(user);

        return true;
    } catch (error) {
        console.error('Error en changeOwnPasswordService:', error);
        throw error;
    }
}