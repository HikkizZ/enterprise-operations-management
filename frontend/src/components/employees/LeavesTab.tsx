import { useQuery } from '@tanstack/react-query';
import { FileText, FileCheck, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLeavesByEmployeeApi } from '@/api/leave.api';
import { estadoSolicitud, tipoSolicitud } from '@/types/employee.types';

function getLeaveStatusBadge(status: string) {
    switch (status) {
        case estadoSolicitud.APROBADA:
            return <Badge className="bg-status-active/15 text-status-active border-0">Aprobada</Badge>;
        case estadoSolicitud.PENDIENTE:
            return <Badge className="bg-status-warning/15 text-status-warning border-0">Pendiente</Badge>;
        case estadoSolicitud.RECHAZADA:
            return <Badge className="bg-destructive/15 text-destructive border-0">Rechazada</Badge>;
        case estadoSolicitud.VENCIDA:
            return <Badge variant="secondary">Vencida</Badge>;
        case estadoSolicitud.CANCELADA:
            return <Badge variant="secondary">Cancelada</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function getLeaveTypeIcon(type: string) {
    switch (type) {
        case tipoSolicitud.LICENCIA:
            return <FileCheck className="size-4 text-status-warning" />;
        case tipoSolicitud.PERMISO:
            return <Calendar className="size-4 text-muted-foreground" />;
        default:
            return <FileText className="size-4 text-muted-foreground" />;
    }
}

function diffDays(start: string, end: string): number {
    const a = new Date(start);
    const b = new Date(end);
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

interface LeavesTabProps {
    employeeId: string;
}

export default function LeavesTab({ employeeId }: LeavesTabProps) {
    const { data: leaves = [], isLoading, isError } = useQuery({
        queryKey: ['employee-leaves', employeeId],
        queryFn: () => getLeavesByEmployeeApi(employeeId),
    });

    if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Cargando licencias...</p>;
    if (isError) return <p className="p-6 text-sm text-destructive">Error al cargar las licencias.</p>;

    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    Solicitudes de Licencias y Permisos
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {leaves.length === 0 ? (
                    <p className="px-6 pb-6 text-center text-sm text-muted-foreground">
                        Sin licencias o permisos registrados.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    {['Tipo', 'Fecha inicio', 'Fecha fin', 'Días', 'Estado'].map(col => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leaves.map(leave => (
                                    <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getLeaveTypeIcon(leave.type)}
                                                <span className="text-sm font-medium text-foreground">{leave.type}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(leave.startDate).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(leave.endDate).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                            {diffDays(leave.startDate, leave.endDate)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {getLeaveStatusBadge(leave.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}