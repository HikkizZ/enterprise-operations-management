import type { Request, Response } from 'express';
import {
    getProfileByEmployeeId,
    updateProfile,
    uploadContract,
    deleteContract
} from '../../services/rrhh/employeeProfile.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from '../../handlers/responseHandlers.js';
import { employeeIdParamSchema } from '../../validations/rrhh/employee.validation.js';
import { updateProfileSchema } from '../../validations/rrhh/employeeProfile.validation.js';
import { User } from  '../../entity/user.entity.js';

export const getProfileByEmployeeIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getProfileByEmployeeId(paramResult.data.id);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Perfil del empleado obtenido exitosamente', response.data);
    } catch (error) {
        console.error('Error en getProfileByEmployeeIdController:', error);
        return handleErrorServer(res);
    }
};

export const updateProfileController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = updateProfileSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de actualización de perfil inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await updateProfile(paramResult.data.id, bodyResult.data, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Perfil del empleado actualizado exitosamente', response.data);
    } catch (error) {
        console.error('Error en updateProfileController:', error);
        return handleErrorServer(res);
    }
};

export const uploadContractController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        if (!req.file) {
            return handleErrorClient(res, 400, 'No se ha proporcionado ningún archivo', null);
        }

        const requester = req.user as User;
        const response = await uploadContract(paramResult.data.id, req.file.filename, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Contrato subido exitosamente', response.data);
    } catch (error) {
        console.error('Error en uploadContractController:', error);
        return handleErrorServer(res);
    }
};

export const deleteContractController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await deleteContract(paramResult.data.id, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Contrato eliminado exitosamente', response.data);
    } catch (error) {
        console.error('Error en deleteContractController:', error);
        return handleErrorServer(res);
    }
};