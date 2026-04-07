import type { User } from "../entity/user.entity.js";

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

export const accountStatuses = ['Activa', 'Inactiva', 'Suspendida'] as const;

export type AccountStatus = (typeof accountStatuses)[number];

export interface UserResponse {
    id: string;
    name: string;
    corporateEmail: string;
    role: UserRole;
    rut: string | null;
    accountStatus: AccountStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserData {
    name: string;
    corporateEmail: string;
    password: string;
    role: UserRole;
    rut: string | null;
}

export type UserQueryParams = {
  id?: string | undefined;
  corporateEmail?: string | undefined;
  rut?: string | undefined;
  role?: UserRole | undefined;
  name?: string | undefined;
}

export type UpdateUserData = {
  name?: string | undefined;
  corporateEmail?: string | undefined;
  password?: string | undefined;
  role?: UserRole | undefined;
  rut?: string | undefined;
  accountStatus?: AccountStatus | undefined;
}

export type SafeUser = Omit<User, 'password'>;

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface LoginData {
  corporateEmail: string;
  password: string;
}

export interface AuthTokenPayload {
  name: string;
  corporateEmail: string;
  role: UserRole;
  rut: string | null;
}
