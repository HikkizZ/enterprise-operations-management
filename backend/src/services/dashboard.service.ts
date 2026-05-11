import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Employee } from "../entity/rrhh/employee.entity.js";
import { EmployeeProfile } from "../entity/rrhh/employeeProfile.entity.js";
import { EmploymentHistory } from "../entity/rrhh/employmentHistory.entity.js";
import { Leave } from "../entity/rrhh/leave.entity.js";
import { userRoles } from "../types/user.types.js";
import { estadoLaboral } from "../types/rrhh/employeeProfile.types.js";
import { estadoSolicitud } from "../types/rrhh/leave.types.js";
import { eventType } from "../types/rrhh/employmentHistory.types.js";
import type { DashboardData, UserStats, RRHHStats, EmployeeStats, PendingLeaveItem, RecentMovementItem } from "../types/dashboard.types.js";
import type { ServiceResponse } from "../types/common.types.js";
import { MoreThanOrEqual, Not, In, Between } from "typeorm";

function startOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfPrevMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

function endOfPrevMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
}

async function getUserStats(): Promise<UserStats> {
    const repo = AppDataSource.getRepository(User);

    const [totalNow, activeNow, newUsersThisMonth, newUsersLastMonth] = await Promise.all([
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR) } }),
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR), accountStatus: 'Activa' } }),
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR), createdAt: MoreThanOrEqual(startOfMonth()) } }),
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR), createdAt: Between(startOfPrevMonth(), endOfPrevMonth()) } }),
    ]);

    return {
        totalUsers: { value: totalNow, delta: newUsersThisMonth - newUsersLastMonth },
        activeUsers: activeNow,
        inactiveUsers: totalNow - activeNow,
    };
}

async function getRRHHStats(): Promise<RRHHStats> {
    const profileRepo = AppDataSource.getRepository(EmployeeProfile);
    const leaveRepo = AppDataSource.getRepository(Leave);
    const historyRepo = AppDataSource.getRepository(EmploymentHistory);

    const [
        totalActiveEmployees,
        hiresThisMonth,
        terminatedThisMonth,
        terminationsLastMonth,
        pendingNow,
        pendingSubmittedThisMonth,
        pendingSubmittedLastMonth,
        approvedThisMonth,
        approvedLastMonth
    ] = await Promise.all([
        profileRepo.count({ where: { status: estadoLaboral.ACTIVO } }),
        historyRepo.count({ where: { eventType: eventType.CONTRATACION, createdAt: MoreThanOrEqual(startOfMonth()) } }),
        historyRepo.count({ where: { eventType: eventType.DESVINCULACION, createdAt: MoreThanOrEqual(startOfMonth()) } }),
        historyRepo.count({ where: { eventType: eventType.DESVINCULACION, createdAt: Between(startOfPrevMonth(), endOfPrevMonth()) } }),
        leaveRepo.count({ where: { status: estadoSolicitud.PENDIENTE } }),
        leaveRepo.count({ where: { status: estadoSolicitud.PENDIENTE, applicationDate: MoreThanOrEqual(startOfMonth()) } }),
        leaveRepo.count({ where: { status: estadoSolicitud.PENDIENTE, applicationDate: Between(startOfPrevMonth(), endOfPrevMonth()) } }),
        leaveRepo.count({ where: { status: estadoSolicitud.APROBADA, applicationDate: MoreThanOrEqual(startOfMonth()) } }),
        leaveRepo.count({ where: { status: estadoSolicitud.APROBADA, applicationDate: Between(startOfPrevMonth(), endOfPrevMonth()) } }),
    ]);

    return {
        totalActiveEmployees: { value: totalActiveEmployees, delta: hiresThisMonth - terminatedThisMonth },
        terminatedThisMonth: { value: terminatedThisMonth, delta: terminatedThisMonth - terminationsLastMonth },
        pendingLeaves: { value: pendingNow, delta: pendingSubmittedThisMonth - pendingSubmittedLastMonth },
        approvedLeavesThisMonth: { value: approvedThisMonth, delta: approvedThisMonth - approvedLastMonth },
    };
}

async function getPendingLeavesList(): Promise<PendingLeaveItem[]> {
    const leaveRepo = AppDataSource.getRepository(Leave);

    const leaves = await leaveRepo.find({
        where: { status: estadoSolicitud.PENDIENTE },
        relations: ['employee'],
        order: { applicationDate: 'ASC' },
        take: 10,
    });

    return leaves.map(leave => {
        const start = leave.startDate instanceof Date ? leave.startDate : new Date(leave.startDate);
        const end = leave.endDate instanceof Date ? leave.endDate : new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return {
            id: leave.id,
            employeeName: `${leave.employee.names} ${leave.employee.paternalSurname}`,
            type: leave.type,
            startDate: start,
            endDate: end,
            days,
        };
    });
}

async function getRecentMovements(): Promise<RecentMovementItem[]> {
    const historyRepo = AppDataSource.getRepository(EmploymentHistory);

    const movements = await historyRepo.find({
        where: {
            eventType: In([
                eventType.CONTRATACION,
                eventType.ACTUALIZACION_LABORAL,
                eventType.REACTIVACION,
                eventType.DESVINCULACION,
            ]),
        },
        relations: ['employee'],
        order: { createdAt: 'DESC' },
        take: 5,
    });

    return movements.map(m => ({
        id: m.id,
        employeeName: `${m.employee.names} ${m.employee.paternalSurname}`,
        eventType: m.eventType,
        date: m.createdAt,
    }));
}

async function getEmployeeStats(rut: string | null): Promise<EmployeeStats> {
    if (!rut) return { employeeStatus: 'N/A', activeLeaves: 0, pendingLeaves: 0 };

    const employeeRepo = AppDataSource.getRepository(Employee);
    const leaveRepo = AppDataSource.getRepository(Leave);

    const employee = await employeeRepo.findOne({ where: { rut }, relations: ['profile'] });

    if (!employee?.profile) return { employeeStatus: 'N/A', activeLeaves: 0, pendingLeaves: 0 };

    const today = new Date();

    const [activeLeaves, pendingLeaves] = await Promise.all([
        leaveRepo.count({
            where: {
                employee: { id: employee.id },
                status: estadoSolicitud.APROBADA,
                endDate: MoreThanOrEqual(today),
            },
        }),
        leaveRepo.count({
            where: {
                employee: { id: employee.id },
                status: estadoSolicitud.PENDIENTE,
            },
        }),
    ]);

    return { employeeStatus: employee.profile.status, activeLeaves, pendingLeaves };
}

export async function getDashboardData(requester: User): Promise<ServiceResponse<DashboardData>> {
    try {
        const { role, rut } = requester;

        if (role === userRoles.SUPER_ADMINISTRADOR) {
            const users = await getUserStats();
            return { ok: true, data: { role, users } };
        }

        if (role === userRoles.ADMINISTRADOR) {
            const [users, rrhh, pendingLeaves, recentMovements] = await Promise.all([
                getUserStats(), getRRHHStats(), getPendingLeavesList(), getRecentMovements()
            ]);
            return { ok: true, data: { role, users, rrhh, pendingLeaves, recentMovements } };
        }

        if (role === userRoles.RECURSOS_HUMANOS || role === userRoles.GERENCIA) {
            const [rrhh, pendingLeaves, recentMovements] = await Promise.all([
                getRRHHStats(), getPendingLeavesList(), getRecentMovements()
            ]);
            return { ok: true, data: { role, rrhh, pendingLeaves, recentMovements } };
        }

        const employee = await getEmployeeStats(rut);

        return { ok: true, data: { role, employee } };
    } catch (error) {
        console.error('Error en getDashboardService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}