import type { Request, Response } from 'express';
import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    terminateEmployee,
    reactivateEmployee
} from '../../services/rrhh/employee.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer, errorStatusMap } from '../../handlers/responseHandlers.js';
import {
    employeeIdParamSchema,
    employeeQuerySchema,
    createEmployeeSchema,
    updateEmployeeSchema,
    updateEmployeeSelfSchema,
    terminateEmployeeSchema,
    reactivateEmployeeSchema
} from '../../validations/rrhh/employee.validation.js';
import { User } from  '../../entity/user.entity.js';

export const getEmployeesController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = employeeQuerySchema.safeParse(req.query)
        if (!result.success) {
            return handleErrorClient(res, 400, 'Parámetros de consulta inválidos', {
                details: result.error.issues.map(i => i.message)
            });
        }

        const response = await getEmployees(result.data);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        const mensaje = response.data.length > 0 ? 'Empleados obtenidos exitosamente' : 'No se encontraron empleados con los criterios de búsqueda';

        return handleSuccess(res, 200, mensaje, response.data);
    } catch (error) {
        console.error('Error en getEmployeesController:', error);
        return handleErrorServer(res);
        
    }
};

export const getEmployeeByIdController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);

        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const response = await getEmployeeById(paramResult.data.id);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Empleado obtenido exitosamente', response.data);
    } catch (error) {
        console.error('Error en getEmployeeByIdController:', error);
        return handleErrorServer(res);
    }
};

export const createEmployeeController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const bodyResult = createEmployeeSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de empleado inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await createEmployee(bodyResult.data, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, response.error.meta ?? null);
        }

        const { employee, corporateEmail, emailSent } = response.data;

        return handleSuccess(res, 201, 'Empleado creado exitosamente', {
            employee,
            corporateEmail,
            emailSent
        });
    } catch (error) {
        console.error('Error en createEmployeeController:', error);
        return handleErrorServer(res);
    }
};

export const updateEmployeeController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User & { employee: { id: string } | null };
        const isSelf = requester.employee?.id === paramResult.data.id;
        const schema = isSelf ? updateEmployeeSelfSchema : updateEmployeeSchema;

        const bodyResult = schema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de actualización inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        
        const response = await updateEmployee(paramResult.data.id, bodyResult.data, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Empleado actualizado exitosamente', response.data);
    } catch (error) {
        console.error('Error en updateEmployeeController:', error);
        return handleErrorServer(res);
    }
};

export const terminateEmployeeController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = terminateEmployeeSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de terminación inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await terminateEmployee(paramResult.data.id, bodyResult.data.reason, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        return handleSuccess(res, 200, 'Empleado desvinculado exitosamente', response.data);
    } catch (error) {
        console.error('Error en terminateEmployeeController:', error);
        return handleErrorServer(res);
    }
};

export const reactivateEmployeeController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paramResult = employeeIdParamSchema.safeParse(req.params);
        if (!paramResult.success) {
            return handleErrorClient(res, 400, 'ID de empleado inválido', {
                details: paramResult.error.issues.map(i => i.message)
            });
        }

        const bodyResult = reactivateEmployeeSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return handleErrorClient(res, 400, 'Datos de reactivación inválidos', {
                details: bodyResult.error.issues.map(i => i.message)
            });
        }

        const requester = req.user as User;
        const response = await reactivateEmployee(paramResult.data.id, bodyResult.data, requester);
        if (!response.ok) {
            const status = response.error.code ? errorStatusMap[response.error.code] : 400;
            return handleErrorClient(res, status, response.error.message, null);
        }

        const { employee, corporateEmail, emailSent } = response.data;
        return handleSuccess(res, 200, 'Empleado reactivado exitosamente', {
            employee,
            corporateEmail,
            emailSent
        });
    } catch (error) {
        console.error('Error en reactivateEmployeeController:', error);
        return handleErrorServer(res);
    }
};