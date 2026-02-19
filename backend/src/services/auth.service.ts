import { User } from '../entity/user.entity.js';

import { AppDataSource } from '../config/configDB.js';
import { comparePassword, encryptPassword } from '../utils/encrypt.js';
import { configEnv } from '../config/configEnv.js';
import type { UserResponse, UserData, UserRole, LoginResponse, LoginData, SafeUser, AuthTokenPayload } from '../types/user.types.js';
import type { ServiceResponse } from '../types/common.types.js';
import { formatRut } from 'rut-kit';

import jwt from 'jsonwebtoken';

export async function loginService(user: LoginData): Promise<ServiceResponse<LoginResponse>> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        
        const userFound = await userRepository.findOneBy({ corporateEmail: user.corporateEmail });

        if (!userFound) return { ok: false, error: { message: 'Usuario no encontrado' } };

        if (userFound.accountStatus !== 'Activa') {
            return { ok: false, error: { message: `La cuenta del usuario está ${userFound.accountStatus}` } };
        }

        const isMatch = await comparePassword(user.password, userFound.password);

        if (!isMatch) return { ok: false, error: { message: 'La contraseña ingresada es incorrecta' } };

        const userResponse: UserResponse = {
            id: userFound.id,
            name: userFound.name,
            corporateEmail: userFound.corporateEmail,
            role: userFound.role,
            rut: userFound.rut ? formatRut(userFound.rut) : null,
            accountStatus: userFound.accountStatus,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt,
        };

        const payload: AuthTokenPayload = {
            name: userFound.name,
            corporateEmail: userFound.corporateEmail,
            role: userFound.role,
            rut: userFound.rut ? formatRut(userFound.rut) : null,
        };

        if (!configEnv.auth.accessTokenSecret) {
            return { ok: false, error: { message: 'Error de configuración del servidor. Falta la clave secreta del token de acceso' } };
        }

        const accessToken = jwt.sign(payload, configEnv.auth.accessTokenSecret, { expiresIn: '8h' });
        
        return { ok: true, data: { token: accessToken, user: userResponse } };
    } catch (error) {
        console.error('Error en loginService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

function sanitizeUserTextFields(data: UserData): UserData {
  return {
    ...data,
    name: data.name?.trim().replace(/\s+/g, ' '),
    corporateEmail: data.corporateEmail?.trim().toLowerCase(),
    rut: data.rut ? data.rut.trim() : null,
  };
}

export async function createUserService(userData: UserData): Promise<ServiceResponse<SafeUser>> {
    try {
        userData = sanitizeUserTextFields(userData);

        const { name, corporateEmail, password, role, rut } = userData;

        /* Verificar si el usuario ya existe */
        const userRepository = AppDataSource.getRepository(User);

        const search = rut ? [{ corporateEmail }, { rut }] : [{ corporateEmail }];

        const existingUser = await userRepository.findOne({
            where: search
        });

        if (existingUser) return { ok: false, error: { message: 'Ya existe un usuario con el mismo correo corporativo o RUT' } };

        /* Crear el nuevo usuario */
        const newUser = new User();
        newUser.name = name;
        newUser.corporateEmail = corporateEmail;
        newUser.password = await encryptPassword(password);
        newUser.role = role;
        newUser.rut = rut;
        newUser.accountStatus = 'Activa';

        /* Guardar usuario */
        const savedUser = await userRepository.save(newUser);

        /* Retornar respuesta sin la contraseña */
        const { password: _, ...safeUser } = savedUser;

        return { ok: true, data: safeUser };
    } catch (error) {
        console.error('Error en createUserService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}