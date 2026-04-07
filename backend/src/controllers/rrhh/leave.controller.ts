import type { Request, Response } from 'express';
import {
    createLeave,
    getLeavesByEmployeeId,
    getLeaveById,
    reviewLeave,
    cancelLeave
} from '../../services/rrhh/leave.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from '../../handlers/responseHandlers.js';
import { employeeIdParamSchema } from '../../validations/rrhh/employee.validation.js';
import { leaveIdParamSchema, createLeaveSchema, reviewLeaveSchema } from '../../validations/rrhh/leave.validation.js';
import { User } from  '../../entity/user.entity.js';

export const createLeaveController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = createLeaveSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de solicitud inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const filename = req.file?.filename;
        const response = await createLeave(paramResult.data.id, bodyResult.data, filename);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 201, 'Solicitud creada exitosamente', response.data);
    } catch (error) {
        console.error('Error en createLeaveController:', error);
        return handleErrorServer(res);
    }
};

export const getLeavesByEmployeeIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getLeavesByEmployeeId(paramResult.data.id);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        const mensaje = response.data.length > 0 ? 'Solicitudes del empleado obtenidas exitosamente' : 'El empleado no tiene solicitudes registradas';

        return handleSuccess(res, 200, mensaje, response.data);
    } catch (error) {
        console.error('Error en getLeavesByEmployeeIdController:', error);
        return handleErrorServer(res);
    }
};

export const getLeaveByIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = leaveIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de solicitud inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getLeaveById(paramResult.data.leaveId);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Solicitud obtenida exitosamente', response.data);
    } catch (error) {
        console.error('Error en getLeaveByIdController:', error);
        return handleErrorServer(res);
    }
};

export const reviewLeaveController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = leaveIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de solicitud de permiso inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = reviewLeaveSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de revisión de solicitud inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await reviewLeave(paramResult.data.leaveId, bodyResult.data, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Solicitud revisada exitosamente', response.data);
    } catch (error) {
        console.error('Error en reviewLeaveController:', error);
        return handleErrorServer(res);
    }
};

export const cancelLeaveController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = leaveIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de solicitud inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await cancelLeave(paramResult.data.leaveId);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Solicitud cancelada exitosamente', response.data);
    } catch (error) {
        console.error('Error en cancelLeaveController:', error);
        return handleErrorServer(res);
    }
};