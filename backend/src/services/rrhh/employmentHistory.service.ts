import { AppDataSource } from "../../config/configDB.js";
import { EmploymentHistory } from "../../entity/rrhh/employmentHistory.entity.js";
import type { ServiceResponse } from "../../types/common.types.js";

/* Obtener historial laboral completo de un empleado */
export async function getHistoryByEmployeeId(employeeId: string): Promise<ServiceResponse<EmploymentHistory[]>> {
    try {
        const repo = AppDataSource.getRepository(EmploymentHistory);

        const history = await repo.find({
            where: { employee: { id: employeeId } },
            relations: ['registeredBy'],
            order: { createdAt: 'DESC' },
        });

        return { ok: true, data: history };
    } catch (error) {
        console.error('Error en getHistoryByEmployeeId:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Obtener un registro de historial por ID */
export async function getHistoryById(id: string): Promise<ServiceResponse<EmploymentHistory>> {
    try {
        const repo = AppDataSource.getRepository(EmploymentHistory);

        const record = await repo.findOne({
            where: { id },
            relations: ['employee', 'registeredBy'],
        });

        if (!record) return { ok: false, error: { message: 'Registro de historial no encontrado', code: 'NOT_FOUND' } };

        return { ok: true, data: record };
    } catch (error) {
        console.error('Error en getHistoryById:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}