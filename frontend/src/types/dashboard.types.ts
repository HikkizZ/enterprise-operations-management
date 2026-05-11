import { userRoles, type UserRole } from './auth.types';

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
    startDate: string;
    endDate: string;
    days: number;
}

export const eventType = {
    CONTRATACION: 'Contratacion',
    ACTUALIZACION_LABORAL: 'Actualizacion Laboral',
    ACTUALIZACION_PERSONAL: 'Actualizacion Personal',
    CARGA_CONTRATO: 'Carga Contrato',
    ELIMINACION_CONTRATO: 'Eliminacion Contrato',
    DESVINCULACION: 'Desvinculacion',
    REACTIVACION: 'Reactivacion',
    LICENCIA: 'Licencia',
    PERMISO: 'Permiso',
} as const;

export type EventType = (typeof eventType)[keyof typeof eventType];

export interface RecentMovementItem {
    id: string;
    employeeName: string;
    eventType: EventType;
    date: string;
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
    role: Exclude<UserRole, typeof userRoles.SUPER_ADMINISTRADOR | typeof userRoles.ADMINISTRADOR | typeof userRoles.RECURSOS_HUMANOS | typeof userRoles.GERENCIA>;
    employee: EmployeeStats;
}

export type DashboardData =
    | SuperAdminDashboard
    | AdminDashboard
    | RRHHDashboard
    | GerenciaDashboard
    | EmployeeDashboard;
