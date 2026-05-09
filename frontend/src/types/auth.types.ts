export const userRoles = {
    SUPER_ADMINISTRADOR: 'SuperAdministrador',
    ADMINISTRADOR: 'Administrador',
    USUARIO: 'Usuario',
    RECURSOS_HUMANOS: 'RecursosHumanos',
    GERENCIA: 'Gerencia',
    VENTAS: 'Ventas',
    ARRIENDO: 'Arriendo',
    FINANZAS: 'Finanzas',
    MECANICO: 'Mecánico',
    MANTENCIONES_MAQUINARIA: 'Mantenciones de Maquinaria',
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];
export type AccountStatus = 'Activa' | 'Inactiva' | 'Suspendida';

export interface UserResponse {
    id: string;
    name: string;
    corporateEmail: string;
    role: UserRole;
    rut: string | null;
    accountStatus: AccountStatus;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export interface ApiSuccess<T> {
    status: 'success';
    message: string;
    data: T;
}