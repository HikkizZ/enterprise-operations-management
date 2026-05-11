import axios from 'axios';
import apiClient from './axiosClient';
import type { ApiSuccess } from '@/types/auth.types';
import type { CreateEmployeeBody, CreateEmployeeResult, EmployeeResponse, EmploymentHistoryResponse } from '@/types/employee.types';

export async function getEmployeesApi(params?: {
    page?: number;
    limit?: number;
    name?: string;
    rut?: string;
    includeTerminated?: boolean;
}): Promise<EmployeeResponse[]> {
    try {
        const { data } = await apiClient.get<ApiSuccess<EmployeeResponse[]>>('/employees', { params });
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message)
            throw new Error(err.response.data.message as string);
        throw new Error('Error al obtener los empleados');
    }
}

export async function getEmployeeByIdApi(id: string): Promise<EmployeeResponse> {
    try {
        const { data } = await apiClient.get<ApiSuccess<EmployeeResponse>>(`/employees/${id}`);
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message)
            throw new Error(err.response.data.message as string);
        throw new Error('Error al obtener el empleado');
    }
}

export async function createEmployeeApi(body: CreateEmployeeBody): Promise<CreateEmployeeResult> {
    try {
        const { data } = await apiClient.post<ApiSuccess<CreateEmployeeResult>>('/employees', body);
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message)
            throw new Error(err.response.data.message as string);
        throw new Error('Error al crear el empleado');
    }
}

export async function getEmployeeHistoryApi(id: string): Promise<EmploymentHistoryResponse[]> {
    try {
        const { data } = await apiClient.get<ApiSuccess<EmploymentHistoryResponse[]>>(`/employees/${id}/history`);
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message)
            throw new Error(err.response.data.message as string);
        throw new Error('Error al obtener el historial laboral');
    }
}