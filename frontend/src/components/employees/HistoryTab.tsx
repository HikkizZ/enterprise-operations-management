import { useQuery } from '@tanstack/react-query';
import {
    CheckCircle2, Briefcase, User, FileCheck, FileMinus, XCircle, RefreshCw, FileText, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmployeeHistoryApi } from '@/api/employee.api';
import { eventType } from '@/types/dashboard.types';

type IconComponent = React.ElementType;

const eventIconMap: Record<string, { icon: IconComponent; label: string }> = {
    [eventType.CONTRATACION]: { icon: CheckCircle2, label: 'Contratación' },
    [eventType.ACTUALIZACION_LABORAL]: { icon: Briefcase, label: 'Actualización laboral' },
    [eventType.ACTUALIZACION_PERSONAL]: { icon: User, label: 'Actualización personal' },
    [eventType.CARGA_CONTRATO]: { icon: FileCheck, label: 'Carga de contrato' },
    [eventType.ELIMINACION_CONTRATO]: { icon: FileMinus, label: 'Eliminación de contrato' },
    [eventType.DESVINCULACION]: { icon: XCircle, label: 'Desvinculación' },
    [eventType.REACTIVACION]: { icon: RefreshCw, label: 'Reactivación' },
    [eventType.LICENCIA]: { icon: FileText, label: 'Licencia médica' },
    [eventType.PERMISO]: { icon: FileText, label: 'Permiso administrativo' },
};

interface HistoryTabProps {
    employeeId: string;
}

export default function HistoryTab({ employeeId }: HistoryTabProps) {
    const { data: history = [], isLoading, isError } = useQuery({
        queryKey: ['employee-history', employeeId],
        queryFn: () => getEmployeeHistoryApi(employeeId),
    });

    if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Cargando historial...</p>;
    if (isError) return <p className="p-6 text-sm text-destructive">Error al cargar el historial.</p>;

    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    Historial de Eventos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {history.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">Sin registros de historial.</p>
                ) : (
                    <div className="relative space-y-0">
                        {history.map((entry, idx) => {
                            const meta = eventIconMap[entry.eventType] ?? { icon: FileText, label: entry.eventType };
                            const Icon = meta.icon;
                            const isLast = idx === history.length - 1;
                            return (
                                <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
                                    {!isLast && (
                                        <div className="absolute left-3.75 top-8 h-full w-px bg-border" />
                                    )}
                                    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                                        <Icon className="size-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-foreground">{meta.label}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(entry.startDate).toLocaleDateString('es-CL')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {entry.jobTitle} · {entry.area}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ${entry.baseSalary.toLocaleString('es-CL')} — {entry.contractType}, {entry.employmentType}
                                        </p>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground italic">{entry.notes}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}