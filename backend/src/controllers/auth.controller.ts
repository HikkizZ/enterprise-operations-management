import type { Request, Response } from 'express';
import { loginService } from '../services/auth.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from '../handlers/responseHandlers.js';
import { loginSchema } from '../validations/auth.validation.js';
import e from 'express';

/* Login */
export const loginController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return handleErrorClient(res, 400, 'Datos de inicio de sesión inválidos', {
                details: result.error.issues.map(i => i.message)
            });
        }

        const response = await loginService(result.data);

        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Usuario autenticado correctamente', response.data);

    } catch (error) {
        console.error('Error en loginController:', error);
        return handleErrorServer(res);
    }
}

/* Logout */
export const logoutController = async (_req: Request, res: Response): Promise<Response> => {
    try {
        return handleSuccess(res, 200, 'Sesión cerrada exitosamente', null);
    }catch (error) {
        console.error('Error en logoutController:', error);
        return handleErrorServer(res);
    }
}