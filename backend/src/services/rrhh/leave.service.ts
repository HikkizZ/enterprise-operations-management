import { AppDataSource } from "../../config/configDB.js";
import { Employee } from "../../entity/rrhh/employee.entity.js";
import { EmployeeProfile } from "../../entity/rrhh/employeeProfile.entity.js";
import { EmploymentHistory } from "../../entity/rrhh/employmentHistory.entity.js";
import { Leave } from "../../entity/rrhh/leave.entity.js";
import { User } from "../../entity/user.entity.js";
import { IsNull, LessThanOrEqual, MoreThanOrEqual, LessThan } from "typeorm";
import { estadoLaboral } from "../../types/employeeProfile.types.js";
import { EstadoSolicitud, TipoSolicitud, type CreateLeaveInput, type ReviewLeaveInput } from "../../types/leave.types.js";
import { eventType } from "../../types/employmentHistory.types.js";
import { sendEmail } from "../email.service.js";
import { leaveApprovedTemplate, leaveRejectedTemplate } from "../../templates/email/leave.template.js";
import type { ServiceResponse } from "../../types/common.types.js";
import { es } from "zod/locales";

function buildFullName(employee: Employee): string {
    return [employee.names, employee.paternalSurname, employee.maternalSurname].filter(Boolean).join(' ');
}

/* Crear solicitud de licencia o permiso */
export async function createLeave(employeeId: string, input: CreateLeaveInput, filename?: string): Promise<ServiceResponse<Leave>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepo.findOne({
            where: { id: employeeId, deletedAt: IsNull() },
            relations: ['profile'],
        });

        if (!employee || !employee.profile) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Empleado no encontrado', code: 'NOT_FOUND' } };
        }

        if (employee.profile.status === estadoLaboral.DESVINCULADO) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'No se pueden crear solicitudes para empleados desvinculados', code: 'CONFLICT' } };
        }

        /* Validar que licencia médica tenga archivo adjunto */
        if (input.type === TipoSolicitud.LICENCIA && !filename) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Las licencias médicas requieren un archivo adjunto', code: 'BAD_REQUEST' } };
        }

        /* Validar fechas */
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (input.startDate < today) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'La fecha de inicio debe ser hoy o en el futuro', code: 'BAD_REQUEST' } };
        }

        if (input.endDate <= input.startDate) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'La fecha de finalización debe ser posterior a la fecha de inicio', code: 'BAD_REQUEST' } };
        }

        /* Validar solapamiento con solicitudes aprobadas */
        const leaveRepo = queryRunner.manager.getRepository(Leave);

        const overlap = await leaveRepo.findOne({
            where: {
                employee: { id: employeeId },
                status: EstadoSolicitud.APROBADA,
                startDate: LessThanOrEqual(input.endDate),
                endDate: MoreThanOrEqual(input.startDate),
            },
        });

        if (overlap) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Las fechas se solapan con una licencia o permiso ya aprobado', code: 'CONFLICT' } };
        }

        const leave = leaveRepo.create({
            employee,
            type: input.type,
            startDate: input.startDate,
            endDate: input.endDate,
            reason: input.reason,
            status: EstadoSolicitud.PENDIENTE,
            attachedFileURL: filename ?? null,
        });

        await leaveRepo.save(leave);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: leave };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en createLeave:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Obtener solicitudes de un empleado */
export async function getLeavesByEmployeeId(employeeId: string): Promise<ServiceResponse<Leave[]>> {
    try {
        const repo = AppDataSource.getRepository(Leave);

        const leaves = await repo.find({
            where: { employee: { id: employeeId } },
            relations: ['reviewedBy'],
            order: { applicationDate: 'DESC' },
        });

        return { ok: true, data: leaves };
    } catch (error) {
        console.error('Error en getLeavesByEmployeeId:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Obtener solicitud por ID */
export async function getLeaveById(id: string): Promise<ServiceResponse<Leave>> {
    try {
        const repo = AppDataSource.getRepository(Leave);

        const leave = await repo.findOne({
            where: { id },
            relations: ['employee', 'reviewedBy'],
        });

        if (!leave) return { ok: false, error: { message: 'Solicitud no encontrada', code: 'NOT_FOUND' } };

        return { ok: true, data: leave };
    } catch (error) {
        console.error('Error en getLeaveById:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Aprobar o rechazar una solicitud */
export async function reviewLeave(id: string, input: ReviewLeaveInput, reviewerBy: User): Promise<ServiceResponse<Leave>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const leaveRepo = queryRunner.manager.getRepository(Leave);

        const leave = await leaveRepo.findOne({
            where: { id },
            relations: ['employee', 'employee.profile'],
        });

        if (!leave) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Solicitud no encontrada', code: 'NOT_FOUND' } };
        }

        if (leave.status !== EstadoSolicitud.PENDIENTE) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Solo se pueden revisar solicitudes pendientes', code: 'CONFLICT' } };
        }

        if (input.status === EstadoSolicitud.APROBADA) {
            /* Verificar solapamiento al momento de aprobar */
            const overlap = await leaveRepo.findOne({
                where: {
                    employee: { id: leave.employee.id },
                    status: EstadoSolicitud.APROBADA,
                    startDate: LessThanOrEqual(leave.endDate),
                    endDate: MoreThanOrEqual(leave.startDate),
                },
            });

            if (overlap) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return { ok: false, error: { message: 'Las fechas se solapan con una licencia o permiso ya aprobado', code: 'CONFLICT' } };
            }

            /* Guardar fechas en perfil para visibilidad */
            if (leave.employee.profile) {
                const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);

                leave.employee.profile.leaveStartDate = leave.startDate;
                leave.employee.profile.leaveEndDate = leave.endDate;
                leave.employee.profile.leaveReason = leave.reason;
                await profileRepo.save(leave.employee.profile);
            }
        }

        leave.status = input.status === EstadoSolicitud.APROBADA ? EstadoSolicitud.APROBADA : EstadoSolicitud.RECHAZADA;
        leave.comments = input.comments ?? null;
        leave.reviewedBy = reviewerBy;

        await leaveRepo.save(leave);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        /* Enviar email de notificación fuera de la transacción */
        try {
            const name = buildFullName(leave.employee);
            const leaveType = leave.type;
            const startDate = leave.startDate.toISOString().split('T')[0]!;
            const endDate = leave.endDate.toISOString().split('T')[0]!;

            if (leave.status === EstadoSolicitud.APROBADA) {
                await sendEmail({
                    to: leave.employee.email,
                    subject: 'Tu solicitud ha sido aprobada',
                    html: leaveApprovedTemplate({ name, leaveType, startDate, endDate, ...(input.comments ? { reviewerComments: input.comments } : {}) }),
                });
            } else {
                await sendEmail({
                    to: leave.employee.email,
                    subject: 'Tu solicitud ha sido rechazada',
                    html: leaveRejectedTemplate({ name, leaveType, startDate, endDate, ...(input.comments ? { reviewerComments: input.comments } : {}) }),
                });
            }
        } catch (emailError) {
            console.error('Error al enviar correo de revisión:', emailError);
        }

        return { ok: true, data: leave };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en reviewLeave:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Cancelar una solicitud pendiente */
export async function cancelLeave(id: string): Promise<ServiceResponse<Leave>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const leaveRepo = queryRunner.manager.getRepository(Leave);

        const leave = await leaveRepo.findOne({
            where: { id },
            relations: ['employee', 'employee.profile'],
        });

        if (!leave) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Solicitud no encontrada', code: 'NOT_FOUND' } };
        }

        if (leave.status !== EstadoSolicitud.PENDIENTE) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return { ok: false, error: { message: 'Solo se pueden cancelar solicitudes pendientes', code: 'CONFLICT' } };
        }

        leave.status = EstadoSolicitud.CANCELADA;
        await leaveRepo.save(leave);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: leave };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en cancelLeave:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}

/* Cron job - Activar y vencer solicitudes segun fecha */
export async function processLeaveCron(): Promise<ServiceResponse<{ activated: number; expired: number }>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const leaveRepo = queryRunner.manager.getRepository(Leave);
        const profileRepo = queryRunner.manager.getRepository(EmployeeProfile);
        const historyRepo = queryRunner.manager.getRepository(EmploymentHistory);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activated = 0;
        let expired = 0;

        /* Activar - Licencias aprobadas cuyo inicio sea hoy */
        const toActivate = await leaveRepo.find({
            where: {
                status: EstadoSolicitud.APROBADA,
                startDate: today,
            },
            relations: ['employee', 'employee.profile'],
        });

        for (const leave of toActivate) {
            const profile = leave.employee.profile;
            if (!profile || profile.status === estadoLaboral.DESVINCULADO) continue;

            const newStatus = leave.type === TipoSolicitud.LICENCIA ? estadoLaboral.LICENCIA : estadoLaboral.PERMISO;

            profile.status = newStatus;
            await profileRepo.save(profile);

            const history = historyRepo.create({
                employee: leave.employee,
                jobTitle: profile.jobTitle,
                area: profile.area,
                contractType: profile.contractType,
                employmentType: profile.employmentType,
                baseSalary: profile.baseSalary,
                startDate: leave.startDate,
                status: newStatus,
                afp: profile.fondoAFP ?? 'Por definir',
                healthInsurance: profile.previsionSalud ?? 'Por definir',
                unemploymentInsurance: profile.seguroCesantia ?? 'Por definir',
                leaveStartDate: leave.startDate,
                leaveEndDate: leave.endDate,
                leaveReason: leave.reason,
                eventType: leave.type === TipoSolicitud.LICENCIA
                    ? eventType.LICENCIA
                    : eventType.PERMISO,
                notes: `Inicio de ${leave.type}`,
            });

            await historyRepo.save(history);
            activated++;
        }

        /* Vencer - Licencias aprobadas cuyo endDate ya pasó */
        const toExpire = await leaveRepo.find({
            where: {
                status: EstadoSolicitud.APROBADA,
                endDate: LessThan(today),
            },
            relations: ['employee', 'employee.profile'],
        });

        for (const leave of toExpire) {
            const profile = leave.employee.profile;
            if (!profile || profile.status === estadoLaboral.DESVINCULADO) continue;

            leave.status = EstadoSolicitud.VENCIDA;
            await leaveRepo.save(leave);

            profile.status = estadoLaboral.ACTIVO;
            profile.leaveStartDate = null;
            profile.leaveEndDate = null;
            profile.leaveReason = null;
            await profileRepo.save(profile);

            const history = historyRepo.create({
                employee: leave.employee,
                jobTitle: profile.jobTitle,
                area: profile.area,
                contractType: profile.contractType,
                employmentType: profile.employmentType,
                baseSalary: profile.baseSalary,
                startDate: leave.endDate,
                status: estadoLaboral.ACTIVO,
                afp: profile.fondoAFP ?? 'Por definir',
                healthInsurance: profile.previsionSalud ?? 'Por definir',
                unemploymentInsurance: profile.seguroCesantia ?? 'Por definir',
                eventType: leave.type === TipoSolicitud.LICENCIA
                    ? eventType.LICENCIA
                    : eventType.PERMISO,
                notes: `Fin de ${leave.type} — reintegro a actividad`,
            });

            await historyRepo.save(history);
            expired++;
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return { ok: true, data: { activated, expired } };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error('Error en processLeaveCron:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}