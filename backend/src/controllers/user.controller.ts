import type { Request, Response } from "express";
import {
    getUsersService,
    updateUserService,
    updateOwnProfileService,
    changeOwnPasswordService
} from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { userQueryValidationSchema, updateUserBodyValidation, createUserBodyValidation } from "../validations/user.validation.js";
import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";

/* Controlador para obtener usuarios con o sin filtros */
export const getUsersController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { error, value } = userQueryValidationSchema.validate(req.query);

        if (error) {
            return handleErrorClient(res, 400, 'Parámetros de consulta inválidos', {
                details: error.details.map(detail => detail.message)
            });
        }

        const response = await getUsersService(value);

        if (!response.ok) {
            return handleErrorClient(res, 400, 'Error al obtener usuarios', response.error);
        }

        const usersData = response.data ?? [];
        const mensaje = usersData.length > 0 ? 'Usuarios obtenidos exitosamente' : 'No se encontraron usuarios con los criterios proporcionados';

        return handleSuccess(res, 200, mensaje, usersData);
    } catch (err) {
        console.error('Error en getUsersController:', err);
        return handleErrorServer(res);
    }
}

/* Controlador para actualizar un usuario */
export const updateUserController = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return handleErrorClient(res, 401, 'Usuario no autenticado', null);
        }

        const requester = req.user as User;

        const { error: queryError, value: queryValue } = userQueryValidationSchema.validate(req.query);

        if (queryError) {
            return handleErrorClient(res, 400, 'Parámetros de consulta inválidos', {
                details: queryError.details.map(detail => detail.message)
            });
        }

        const { error: bodyError, value: bodyValue } = updateUserBodyValidation.validate(req.body);

        if (bodyError) {
            return handleErrorClient(res, 400, 'Cuerpo de la solicitud inválido', {
                details: bodyError.details.map(detail => detail.message)
            });
        }

        const user = await updateUserService(queryValue, bodyValue, requester);

        if (!user) {
            return handleErrorClient(res, 404, 'Usuario no encontrado', null);
        }

        return handleSuccess(res, 200, 'Usuario actualizado exitosamente', user);
    } catch (err: any) {
        console.error('Error en updateUserController:', err);

        /* Si el servicio lanza un errores estructurados */
        if (err?.status && err?.message) {
            return handleErrorClient(res, err.status, err.message, err.details);
        }

        return handleErrorServer(res);
    }
}