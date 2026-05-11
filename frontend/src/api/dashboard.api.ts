import axios from "axios";
import apiClient from "./axiosClient";
import type { ApiSuccess } from "@/types/auth.types";
import type { DashboardData } from "@/types/dashboard.types";

export async function getDashboardApi(): Promise<DashboardData> {
    try {
        const { data } = await apiClient.get<ApiSuccess<DashboardData>>('/dashboard');
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
            throw new Error(err.response.data.message as string);
        }
        throw new Error("Error al obtener los datos del dashboard");
    }
}