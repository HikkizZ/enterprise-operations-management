import { User } from '../entity/user.entity.js';
import { AppDataSource } from '../config/configDB.js';
import { encryptPassword, comparePassword } from '../utils/encrypt.js';
import type { UserQueryParams, UpdateUserData, SafeUser } from '../types/user.types.js';
import type { ServiceResponse } from '../types/common.types.js';
import { Not, ILike } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { cleanRut } from 'rut-kit';

/* Buscar usuarios con filtro */
export async function getUsersService(query: UserQueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        const userRepository = AppDataSource.getRepository(User);

        if (query.rut) {
            const cleanRutValue = cleanRut(query.rut);

            const users = await userRepository.createQueryBuilder('user')
                .where(`REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut`, { cleanRut: cleanRutValue })
                .andWhere("user.role != :superAdminRole", { superAdminRole: 'SuperAdministrador' })
                .getMany();

            if (!users.length) return { ok: true, data: [] };
            
            const usersData: SafeUser[] = users.map(({ password: _p, ...user }) => user);
            return { ok: true, data: usersData };
        }

        const whereClause: FindOptionsWhere<User> = { role: Not('SuperAdministrador') };

        if (query.id) whereClause.id = query.id;

        if (query.corporateEmail) whereClause.corporateEmail = ILike(`%${query.corporateEmail}%`);

        if (query.name) whereClause.name = ILike(`%${query.name}%`);

        if (query.role) whereClause.role = query.role;
        
        const users = await userRepository.find({ 
            where: whereClause,
            order: { createdAt: 'DESC' } 
        });

        const usersData: SafeUser[] = users.map(({ password: _p, ...user }) => user);
        return { ok: true, data: usersData };
    } catch (error) {
        console.error('Error en getUsersService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

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

/* Actualizar datos de usuario */
export const updateUserService = async (
    query: {id?: string | undefined, rut?: string | undefined, corporateEmail?: string | undefined},
    body: UpdateUserData,
    requester: User
    ): Promise<ServiceResponse<SafeUser>> => {
    try {
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

        if (!user) return { ok: false, error: { message: 'Usuario no encontrado', code: 'NOT_FOUND' } };

        if (user.role === 'SuperAdministrador') {
            return { ok: false, error: { message: 'No se puede modificar un usuario con rol SuperAdministrador', code: 'FORBIDDEN' } };
        }

        /* Permisos */
        const isSelf = requester.id === user.id;
        const allowedRoles = ['SuperAdministrador', 'Administrador', 'RecursosHumanos'];

        /* Si es el propio usuario, solo puede modificar su password */
        if (isSelf) {
            const keys = Object.keys(cleanedBody);
        
            if (!cleanedBody.password || keys.length !== 1) {
                return { ok: false, error: { message: 'No tiene permiso para modificar estos datos.', code: 'FORBIDDEN' } };
            }
        } else {
            /* Si no es el propio usuario, debe tener un rol permitido */
            if (!allowedRoles.includes(requester.role)) {
                return { ok: false, error: { message: 'No tiene permiso para modificar este usuario.', code: 'FORBIDDEN' } };
            }
        }

        /* No puede cambiar su propio rol */
        if (isSelf && cleanedBody.role) {
            return { ok: false, error: { message: 'No tiene permiso para modificar su propio rol.', code: 'FORBIDDEN' } };
        }

        /* No se puede cambiar a SuperAdministrador */
        if (cleanedBody.role === 'SuperAdministrador') {
            return { ok: false, error: { message: 'No se puede cambiar un usuario a SuperAdministrador.', code: 'FORBIDDEN' } };
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

        const { password: _p, ...userData } = updatedUser;
        return { ok: true, data: userData };
    } catch (error) {
        console.error('Error en updateUserService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
};