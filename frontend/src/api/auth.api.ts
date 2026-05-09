import axios from 'axios';
import apiClient from './axiosClient';
import type { ApiSuccess, LoginResponse } from '@/types/auth.types';

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    try {
        const { data } = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/login', {
            corporateEmail: email,
            password,
        });
        return data.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
            throw new Error(err.response.data.message as string);
        }
        throw new Error('Error al iniciar sesión');
    }
}