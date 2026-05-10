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
import type { DashboardData, UserStats, RRHHStats, EmployeeStats } from "../types/dashboard.types.js";
import type { ServiceResponse } from "../types/common.types.js";
import { MoreThanOrEqual, Not } from "typeorm";

function startOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function getUserStats(): Promise<UserStats> {
    const repo = AppDataSource.getRepository(User);

    const [totalUsers, activeUsers] = await Promise.all([
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR) } }),
        repo.count({ where: { role: Not(userRoles.SUPER_ADMINISTRADOR), accountStatus: 'Activa' } }),
    ]);

    return { totalUsers, activeUsers, inactiveUsers: totalUsers - activeUsers };
}

async function getRRHHStats(): Promise<RRHHStats> {
    const profileRepo = AppDataSource.getRepository(EmployeeProfile);
    const leaveRepo = AppDataSource.getRepository(Leave);
    const historyRepo = AppDataSource.getRepository(EmploymentHistory);

    const [totalActiveEmployees, terminatedThisMonth, pendingLeaves, approvedLeavesThisMonth] = await Promise.all([
        profileRepo.count({ where: { status: estadoLaboral.ACTIVO } }),
        historyRepo.count({ where: { eventType: eventType.DESVINCULACION, createdAt: MoreThanOrEqual(startOfMonth()) } }),
        leaveRepo.count({ where: { status: estadoSolicitud.PENDIENTE } }),
        leaveRepo.count({ where: { status: estadoSolicitud.APROBADA, applicationDate: MoreThanOrEqual(startOfMonth()) } }),
    ]);

    return { totalActiveEmployees, terminatedThisMonth, pendingLeaves, approvedLeavesThisMonth };
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
            const [users, rrhh] = await Promise.all([getUserStats(), getRRHHStats()]);
            return { ok: true, data: { role, users, rrhh } };
        }

        if (role === userRoles.RECURSOS_HUMANOS || role === userRoles.GERENCIA) {
            const rrhh = await getRRHHStats();
            return { ok: true, data: { role, rrhh } };
        }

        const employee = await getEmployeeStats(rut);
        return { ok: true, data: { role, employee } };
    } catch (error) {
        console.error('Error en getDashboardService:', error);
        return { ok: false, error: { message: 'Error interno del servidor' } };
    }
}