import type { Request, Response } from 'express';
import { getHistoryByEmployeeId, getHistoryById } from '../../services/rrhh/employmentHistory.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from '../../handlers/responseHandlers.js';
import { employeeIdParamSchema } from '../../validations/rrhh/employee.validation.js';
import { historyIdParamSchema } from '../../validations/rrhh/employmentHistory.validation.js';

export const getHistoryByEmployeeIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getHistoryByEmployeeId(paramResult.data.id);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        const mensaje = response.data.length > 0 ? 'Historial laboral del empleado obtenido exitosamente' : 'No se encontraron registros en el historial laboral';
        return handleSuccess(res, 200, mensaje, response.data);
    } catch (error) {
        console.error('Error en getHistoryByEmployeeIdController:', error);
        return handleErrorServer(res);
    }
};

export const getHistoryByIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = historyIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de historial laboral inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getHistoryById(paramResult.data.historyId);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Registro del historial laboral obtenido exitosamente', response.data);
    } catch (error) {
        console.error('Error en getHistoryByIdController:', error);
        return handleErrorServer(res);
    }
};