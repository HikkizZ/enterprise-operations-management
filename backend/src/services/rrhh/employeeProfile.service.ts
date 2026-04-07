import { AppDataSource } from "../../config/configDB.js";
import { Employee } from "../../entity/rrhh/employee.entity.js";
import { EmployeeProfile } from "../../entity/rrhh/employeeProfile.entity.js";
import { EmploymentHistory } from "../../entity/rrhh/employmentHistory.entity.js";
import { User } from "../../entity/user.entity.js";
import { IsNull } from "typeorm";
import { estadoLaboral, tipoContrato, type UpdateProfileInput } from "../../types/rrhh/employeeProfile.types.js";
import { eventType } from "../../types/rrhh/employmentHistory.types.js";
import type { ServiceResponse } from "../../types/common.types.js";

const DEFAULT_VALUE = 'Por definir';

function datesEqual(a: Date | null | undefined, b: Date | null | undefined): boolean {
    const na = a ?? null;
    const nb = b ?? null;
    if (na === null && nb === null) return true;
    if (na === null || nb === null) return false;
    return na.getTime() === nb.getTime();
}

/* Obtener perfil por ID de usuario */
export async function getProfileByEmployeeId(employeeId: string): Promise<ServiceResponse<EmployeeProfile>> {
    try {
        const repo = AppDataSource.getRepository(EmployeeProfile);

        const profile = await repo.findOne({ where: { employee: { id: employeeId } }, relations: ['employee'] });

        if (!profile) return { ok: false, error: { message: 'Perfil no encontrado', code: 'NOT_FOUND' } };

        return { ok: true, data: profile };
    } catch (error) {
        console.error('Error en getProfileByEmployeeId:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Actualizar datos laborales del perfil */
export async function updateProfile(employeeId: string, input: UpdateProfileInput, registeredBy?: User): Promise<ServiceResponse<EmployeeProfile>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id: employeeId, deletedAt: IsNull() }, relations: ['profile'] });

        if (!employee || !employee.profile) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado o perfil no encontrado', code: 'NOT_FOUND' } };
        }

        const profile = employee.profile;

        /* Guard - Empleado desvinculado */
        if (profile.status === estadoLaboral.DESVINCULADO) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'No se pueden actualizar datos de un empleado desvinculado', code: 'CONFLICT' } };
        }

        /* Primera actualización real - Exige campos obligatorios */
        const isDefaultProfile = profile.jobTitle === DEFAULT_VALUE && profile.area === DEFAULT_VALUE && profile.contractType === DEFAULT_VALUE;

        if (isDefaultProfile) {
            const requiredFields: (keyof UpdateProfileInput)[] = ['jobTitle', 'area', 'contractType', 'baseSalary'];
            const missing = requiredFields.filter(f => input[f] === undefined);
            if (missing.length > 0) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return { ok: false, error: { message: `Faltan campos obligatorios para la primera actualización: ${missing.join(', ')}`, code: 'BAD_REQUEST' } };
            }
        }

        /* Coherencia de fechas */
        const effectiveStart = input.startDateContract !== undefined ? input.startDateContract : profile.startDateContract;
        const effectiveEnd = input.endDateContract !== undefined ? input.endDateContract : profile.endDateContract;
        const effectiveContractType = input.contractType !== undefined ? input.contractType : profile.contractType;

        if (effectiveStart && effectiveEnd && effectiveStart >= effectiveEnd) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'La fecha de inicio del contrato debe ser anterior a la fecha de término', code: 'BAD_REQUEST' } };
        }

        if (effectiveContractType === tipoContrato.INDEFINIDO && effectiveEnd) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Un contrato indefinido no puede tener fecha de término', code: 'BAD_REQUEST' } };
        }

        /* Detección de cambios reales */
        const hasChanges =
            (input.jobTitle !== undefined && input.jobTitle.trim() !== profile.jobTitle) ||
            (input.area !== undefined && input.area.trim() !== profile.area) ||
            (input.contractType !== undefined && input.contractType !== profile.contractType) ||
            (input.employmentType !== undefined && input.employmentType !== profile.employmentType) ||
            (input.baseSalary !== undefined && input.baseSalary !== profile.baseSalary) ||
            (input.previsionSalud !== undefined && input.previsionSalud !== profile.previsionSalud) ||
            (input.fondoAFP !== undefined && input.fondoAFP !== profile.fondoAFP) ||
            (input.seguroCesantia !== undefined && input.seguroCesantia !== profile.seguroCesantia) ||
            (input.startDateContract !== undefined && !datesEqual(input.startDateContract, profile.startDateContract)) ||
            (input.endDateContract !== undefined && !datesEqual(input.endDateContract, profile.endDateContract));

        if (!hasChanges) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'No se detectaron cambios en el perfil', code: 'BAD_REQUEST' } };
        }

        /* Aplicar cambios */
        if (input.jobTitle !== undefined) profile.jobTitle = input.jobTitle.trim();
        if (input.area !== undefined) profile.area = input.area.trim();
        if (input.contractType !== undefined) profile.contractType = input.contractType;
        if (input.employmentType !== undefined) profile.employmentType = input.employmentType;
        if (input.baseSalary !== undefined) profile.baseSalary = input.baseSalary;
        if (input.previsionSalud !== undefined) profile.previsionSalud = input.previsionSalud;
        if (input.fondoAFP !== undefined) profile.fondoAFP = input.fondoAFP;
        if (input.seguroCesantia !== undefined) profile.seguroCesantia = input.seguroCesantia;
        if (input.startDateContract !== undefined) profile.startDateContract = input.startDateContract;
        if (input.endDateContract !== undefined) profile.endDateContract = input.endDateContract;

        const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
        await profileRepo.save(profile);

        /* Snapshot en historial laboral */
        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const history = historyRepo.create({
            employee,
            jobTitle: profile.jobTitle,
            area: profile.area,
            contractType: profile.contractType,
            employmentType: profile.employmentType,
            baseSalary: profile.baseSalary,
            startDate: profile.startDateContract ?? employee.hireDate,
            status: profile.status,
            eventType: eventType.ACTUALIZACION_LABORAL,
            afp: profile.fondoAFP ?? 'Por definir',
            healthInsurance: profile.previsionSalud ?? 'Por definir',
            unemploymentInsurance: profile.seguroCesantia ?? 'Por definir',
            contractURL: profile.contractURL,
            notes: 'Actualización de perfil laboral',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: profile };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en updateProfile:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Subir o reemplazar contrato - El archivo anterior se conserva en el sistema de archivos */
export async function uploadContract(employeeId: string, filename: string, registeredBy?: User): Promise<ServiceResponse<EmployeeProfile>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id: employeeId, deletedAt: IsNull() }, relations: ['profile'] });

        if (!employee || !employee.profile) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado o perfil no encontrado', code: 'NOT_FOUND' } };
        }

        if (employee.profile.status === estadoLaboral.DESVINCULADO) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'No se pueden actualizar el contrato para un empleado desvinculado', code: 'CONFLICT' } };
        }

        const profile = employee.profile;
        const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
        profile.contractURL = filename;
        await profileRepo.save(profile);

        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const history = historyRepo.create({
            employee,
            jobTitle: profile.jobTitle,
            area: profile.area,
            contractType: profile.contractType,
            employmentType: profile.employmentType,
            baseSalary: profile.baseSalary,
            startDate: profile.startDateContract ?? employee.hireDate,
            status: profile.status,
            eventType: eventType.CARGA_CONTRATO,
            afp: profile.fondoAFP ?? 'Por definir',
            healthInsurance: profile.previsionSalud ?? 'Por definir',
            unemploymentInsurance: profile.seguroCesantia ?? 'Por definir',
            contractURL: filename,
            notes: 'Carga de contrato',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: profile };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en uploadContract:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Desvincular contrato del perfil - El archivo fisico se conserva en el sistema de archivos */
export async function deleteContract(employeeId: string, registeredBy?: User): Promise<ServiceResponse<EmployeeProfile>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({ where: { id: employeeId, deletedAt: IsNull() }, relations: ['profile'] });

        if (!employee || !employee.profile) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado o perfil no encontrado', code: 'NOT_FOUND' } };
        }

        const profile = employee.profile;

        if (!profile.contractURL) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'El empleado no tiene contrato registrado', code: 'NOT_FOUND' } };
        }

        const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
        profile.contractURL = null;
        await profileRepo.save(profile);

        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const history = historyRepo.create({
            employee,
            jobTitle: profile.jobTitle,
            area: profile.area,
            contractType: profile.contractType,
            employmentType: profile.employmentType,
            baseSalary: profile.baseSalary,
            startDate: profile.startDateContract ?? employee.hireDate,
            status: profile.status,
            eventType: eventType.ELIMINACION_CONTRATO,
            afp: profile.fondoAFP ?? 'Por definir',
            healthInsurance: profile.previsionSalud ?? 'Por definir',
            unemploymentInsurance: profile.seguroCesantia ?? 'Por definir',
            contractURL: null,
            notes: 'Desvinculación de contrato del perfil',
            registeredBy: registeredBy ?? null,
        });

        await historyRepo.save(history);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: profile };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en deleteContract:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}