import type { EstadoLaboral } from "./employeeProfile.types.js";

export interface CreateEmployeeInput {
    rut: string;
    names: string;
    paternalSurname: string;
    maternalSurname?: string | undefined;
    birthDate?: Date | undefined;
    phoneNumber?: string | undefined;
    email: string;
    emergencyContact?: string | undefined;
    address?: string | undefined;
    hireDate: Date;
}

export interface UpdateEmployeeInput {
    names?: string | undefined;
    paternalSurname?: string | undefined;
    maternalSurname?: string | null | undefined;
    birthDate?: Date | null | undefined;
    phoneNumber?: string | null | undefined;
    email?: string | undefined;
    emergencyContact?: string | null | undefined;
    address?: string | null | undefined;
}

export interface ReactivateEmployeeInput {
    names?: string | undefined;
    paternalSurname?: string | undefined;
    maternalSurname?: string | undefined;
    phoneNumber?: string | null | undefined;
    address?: string | null | undefined;
    reactivationReason: string;
}

export interface EmployeeQueryParams {
    page?: number | undefined;
    limit?: number | undefined;
    rut?: string | undefined;
    name?: string | undefined;
    status?: EstadoLaboral | undefined;
    includeTerminated?: boolean | undefined;
}