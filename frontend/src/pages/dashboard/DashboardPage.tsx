import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Briefcase, UserMinus, Clock, CheckCircle, Activity, Calendar } from 'lucide-react';
import { getDashboardApi } from '@/api/dashboard.api';
import StatsCard from '@/components/dashboard/StatsCard';
import PendingLeavesPanel from '@/components/dashboard/PendingLeavesPanel';
import RecentMovementsPanel from '@/components/dashboard/RecentMovementsPanel';
import { useAuth } from '@/context/AuthContext';
import { userRoles } from '@/types/auth.types';
import type { UserStats, RRHHStats, EmployeeStats, PendingLeaveItem, RecentMovementItem, DashboardData } from
    '@/types/dashboard.types';

function UserStatsSection({ users }: { users: UserStats }) {
    return (
        <>
            <StatsCard title="Total usuarios" value={users.totalUsers} icon={Users} />
            <StatsCard title="Usuarios activos" value={users.activeUsers} icon={UserCheck} />
            <StatsCard title="Usuarios inactivos" value={users.inactiveUsers} icon={UserX} />
        </>
    );
}

function RRHHStatsSection({ rrhh }: { rrhh: RRHHStats }) {
    return (
        <>
            <StatsCard title="Empleados activos" value={rrhh.totalActiveEmployees} icon={Briefcase} />
            <StatsCard title="Desvinculados este mes" value={rrhh.terminatedThisMonth} icon={UserMinus} />
            <StatsCard title="Licencias pendientes" value={rrhh.pendingLeaves} icon={Clock} />
            <StatsCard title="Licencias aprobadas este mes" value={rrhh.approvedLeavesThisMonth} icon={CheckCircle} />
        </>
    );
}

function EmployeeSection({ employee }: { employee: EmployeeStats }) {
    return (
        <>
            <StatsCard title="Estado laboral" value={employee.employeeStatus} icon={Activity} />
            <StatsCard title="Licencias activas" value={employee.activeLeaves} icon={Calendar} />
            <StatsCard title="Solicitudes pendientes" value={employee.pendingLeaves} icon={Clock} />
        </>
    );
}

function PanelsRow({ pendingLeaves, recentMovements }: {
    pendingLeaves: PendingLeaveItem[]; recentMovements:
        RecentMovementItem[]
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PendingLeavesPanel items={pendingLeaves} />
            <RecentMovementsPanel items={recentMovements} />
        </div>
    );
}

function renderDashboard(data: DashboardData) {
    if (data.role === userRoles.SUPER_ADMINISTRADOR)
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <UserStatsSection users={data.users} />
            </div>
        );

    if (data.role === userRoles.ADMINISTRADOR)
        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <UserStatsSection users={data.users} />
                    <RRHHStatsSection rrhh={data.rrhh} />
                </div>
                <PanelsRow pendingLeaves={data.pendingLeaves} recentMovements={data.recentMovements} />
            </>
        );

    if (data.role === userRoles.RECURSOS_HUMANOS || data.role === userRoles.GERENCIA)
        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <RRHHStatsSection rrhh={data.rrhh} />
                </div>
                <PanelsRow pendingLeaves={data.pendingLeaves} recentMovements={data.recentMovements} />
            </>
        );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <EmployeeSection employee={data.employee} />
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboardApi,
    });

    const today = new Date().toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="p-6 space-y-6">
            <div>
                <p className="text-sm text-muted-foreground capitalize">{today}</p>
                <h1 className="text-2xl font-bold text-foreground mt-1">
                    Bienvenido, {user?.name}
                </h1>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="text-sm text-destructive">
                    Error al cargar los datos del dashboard.
                </p>
            )}

            {data && renderDashboard(data)}
        </div>
    );
}