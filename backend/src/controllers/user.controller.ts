import type { Request, Response } from "express";
import {
    getUsersService,
    updateUserService,
} from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from "../handlers/responseHandlers.js";
import { userQuerySchema, userBodySchema } from "../validations/user.validation.js";
import { User } from "../entity/user.entity.js";

/* Controlador para obtener usuarios con o sin filtros */
export const getUsersController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = userQuerySchema.safeParse(req.query);

        if (!result.success) {
            return handleErrorClient(res, 400, 'Parámetros de consulta inválidos', {
                details: result.error.issues.map(i => i.message)
            });
        }

        const response = await getUsersService(result.data);

        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        const mensaje = response.data.length > 0 ? 'Usuarios obtenidos exitosamente' : 'No se encontraron usuarios con los criterios de búsqueda';

        return handleSuccess(res, 200, mensaje, response.data);

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

        const queryResult = userQuerySchema.safeParse(req.query);

        if (!queryResult.success) {
            return handleErrorClient(res, 400, 'Parámetros de consulta inválidos', {
                details: queryResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = userBodySchema.safeParse(req.body);

        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Cuerpo de la solicitud inválido', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await updateUserService(queryResult.data, bodyResult.data, requester);

        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Usuario actualizado exitosamente', response.data);
    } catch (err: any) {
        console.error('Error en updateUserController:', err);
        return handleErrorServer(res);
    }
}