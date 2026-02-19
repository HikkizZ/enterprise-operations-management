import type { User } from "../entity/user.entity.js";

export const userRoles = [
  'SuperAdministrador',
  'Administrador',
  'Usuario',
  'RecursosHumanos',
  'Gerencia',
  'Ventas',
  'Arriendo',
  'Finanzas',
  'Mecánico',
  'Mantenciones de Maquinaria',
] as const;

export type UserRole = (typeof userRoles)[number];

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
  id?: string;
  corporateEmail?: string;
  rut?: string;
  role?: UserRole;
  name?: string;
}

export type UpdateUserData = {
  name?: string;
  corporateEmail?: string;
  password?: string;
  role?: UserRole;
  rut?: string;
  accountStatus?: AccountStatus;
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
