import type { EstadoLaboral } from "./employeeProfile.types.js";

export interface CreateEmployeeInput {
    rut: string;
    names: string;
    paternalSurname: string;
    maternalSurname?: string;
    birthDate?: Date;
    phoneNumber?: string;
    email: string;
    emergencyContact?: string;
    address?: string;
    hireDate: Date;
}

export interface UpdateEmployeeInput {
    names?: string;
    paternalSurname?: string;
    maternalSurname?: string;
    birthDate?: Date | null;
    phoneNumber?: string | null;
    email?: string;
    emergencyContact?: string | null;
    address?: string | null;
}

export interface ReactivateEmployeeInput {
    names?: string;
    paternalSurname?: string;
    maternalSurname?: string;
    phoneNumber?: string | null;
    address?: string | null;
    reactivationReason: string;
}

export interface EmployeeQueryParams {
    page?: number;
    limit?: number;
    rut?: string;
    name?: string;
    status?: EstadoLaboral;
    includeTerminated?: boolean;
}