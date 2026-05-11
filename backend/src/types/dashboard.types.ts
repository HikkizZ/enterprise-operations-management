import { userRoles } from "./user.types.js";

export interface StatItem {
    value: number;
    delta: number;
}

export interface UserStats {
    totalUsers: StatItem;
    activeUsers: number;
    inactiveUsers: number;
}

export interface RRHHStats {
    totalActiveEmployees: StatItem;
    terminatedThisMonth: StatItem;
    pendingLeaves: StatItem;
    approvedLeavesThisMonth: StatItem;
}

export interface EmployeeStats {
    employeeStatus: string;
    activeLeaves: number;
    pendingLeaves: number;
}

export interface PendingLeaveItem {
    id: string;
    employeeName: string;
    type: string;
    startDate: Date;
    endDate: Date;
    days: number;
}

export interface RecentMovementItem {
    id: string;
    employeeName: string;
    eventType: string;
    date: Date;
}

export interface SuperAdminDashboard {
    role: typeof userRoles.SUPER_ADMINISTRADOR;
    users: UserStats;
}

export interface AdminDashboard {
    role: typeof userRoles.ADMINISTRADOR;
    users: UserStats;
    rrhh: RRHHStats;
    pendingLeaves: PendingLeaveItem[];
    recentMovements: RecentMovementItem[];
}

export interface RRHHDashboard {
    role: typeof userRoles.RECURSOS_HUMANOS;
    rrhh: RRHHStats;
    pendingLeaves: PendingLeaveItem[];
    recentMovements: RecentMovementItem[];
}

export interface GerenciaDashboard {
    role: typeof userRoles.GERENCIA;
    rrhh: RRHHStats;
    pendingLeaves: PendingLeaveItem[];
    recentMovements: RecentMovementItem[];
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