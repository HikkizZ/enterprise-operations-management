import { userRoles } from "./user.types.js";

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
}

export interface RRHHStats {
    totalActiveEmployees: number;
    terminatedThisMonth: number;
    pendingLeaves: number;
    approvedLeavesThisMonth: number;
}

export interface EmployeeStats {
    employeeStatus: string;
    activeLeaves: number;
    pendingLeaves: number;
}

export interface SuperAdminDashboard {
    role: typeof userRoles.SUPER_ADMINISTRADOR;
    users: UserStats;
}

export interface AdminDashboard {
    role: typeof userRoles.ADMINISTRADOR;
    users: UserStats;
    rrhh: RRHHStats;
}

export interface RRHHDashboard {
    role: typeof userRoles.RECURSOS_HUMANOS;
    rrhh: RRHHStats;
}

export interface GerenciaDashboard {
    role: typeof userRoles.GERENCIA;
    rrhh: RRHHStats;
}

export interface EmployeeDashboard {
    role: typeof userRoles.USUARIO
    | typeof userRoles.VENTAS
    | typeof userRoles.ARRIENDO
    | typeof userRoles.FINANZAS
    | typeof userRoles.MECANICO
    | typeof userRoles.MANTENCIONES_MAQUINARIA;
    employee: EmployeeStats;
}

export type DashboardData = SuperAdminDashboard | AdminDashboard | RRHHDashboard | GerenciaDashboard | EmployeeDashboard;