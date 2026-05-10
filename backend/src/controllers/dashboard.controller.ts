import type { Request, Response } from 'express';
import { getDashboardData } from '../services/dashboard.service.js';
import { handleSuccess, handleErrorServer } from '../handlers/responseHandlers.js';
import { User } from '../entity/user.entity.js';

export const getDashboardController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const requester = req.user as User;
        const response = await getDashboardData(requester);

        if (!response.ok) return handleErrorServer(res);

        return handleSuccess(res, 200, 'Datos del dashboard obtenidos correctamente', response.data);
    } catch (error) {
        console.error('Error en getDashboardController:', error);
        return handleErrorServer(res);
    }
}