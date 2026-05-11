import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import MyLeavesPage from '@/pages/leaves/MyLeavesPage';
import EmployeesPage from '@/pages/employees/EmployeesPage';
import EmployeeDetailPage from '@/pages/employees/EmployeeDetailPage';

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
                    { path: '/profile', element: <ProfilePage /> },
                    { path: '/my-leaves', element: <MyLeavesPage /> },
                    { path: '/employees', element: <EmployeesPage /> },
                    { path: '/employees/:id', element: <EmployeeDetailPage /> }
                ],
            },
        ],
    },
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
]);