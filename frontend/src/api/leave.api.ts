import axios from "axios";
import apiClient from "./axiosClient";
import type { ApiSuccess } from "@/types/auth.types";
import type { LeaveResponse } from "@/types/employee.types";

export async function getLeavesByEmployeeApi(employeeId: string): Promise<LeaveResponse[]> {
    try {
        const { data } = await apiClient.get<ApiSuccess<LeaveResponse[]>>(`/leaves/employee/${employeeId}`);
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message)
            throw new Error(err.response.data.message as string);
        throw new Error('Error al obtener las licencias');
    }
}