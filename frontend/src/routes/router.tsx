import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '@/pages/dashboard/DashboardPage';

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            { 
                element: <MainLayout />,
                children: [
                    { path: '/dashboard', element: <DashboardPage /> },
                ],
            },
        ],
    },
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
]);