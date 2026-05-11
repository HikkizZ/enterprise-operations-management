import { Briefcase, Building2, Wallet, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EmployeeResponse } from '@/types/employee.types';
import { getStatusBadge } from '@/utils/employeeUtils';

function InfoField({ label, value, mono, icon }: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                {icon}
                <p className={cn('text-sm', mono && 'font-mono', value ? 'text-foreground' : 'text-muted-foreground')}>
                    {value ?? '—'}
                </p>
            </div>
        </div>
    );
}

interface WorkProfileTabProps {
    employee: EmployeeResponse;
}

export default function WorkProfileTab({ employee }: WorkProfileTabProps) {
    const profile = employee.profile;

    if (!profile) {
        return (
            <Card className="border border-border bg-card">
                <CardContent className="p-6">
                    <p className="text-center text-sm text-muted-foreground">
                        Este empleado no tiene perfil laboral registrado.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" />
                    Información Laboral
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Estado</span>
                    {getStatusBadge(profile.status)}
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField label="Cargo" value={profile.jobTitle} />
                    <InfoField
                        label="Área"
                        value={profile.area}
                        icon={<Building2 className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo de contrato</p>
                        {profile.contractType
                            ? <Badge variant="outline" className="font-medium">{profile.contractType}</Badge>
                            : <p className="text-sm text-muted-foreground">—</p>
                        }
                    </div>
                    <InfoField label="Jornada" value={profile.employmentType} />
                    <InfoField
                        label="Sueldo base"
                        value={profile.baseSalary != null ? `$${profile.baseSalary.toLocaleString('es-CL')}` : null}
                        icon={<Wallet className="size-4 text-muted-foreground shrink-0" />}
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField
                        label="AFP"
                        value={profile.fondoAFP}
                        icon={<Shield className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <InfoField label="Salud" value={profile.previsionSalud} />
                    <InfoField label="Seguro de cesantía" value={profile.seguroCesantia} />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField
                        label="Inicio del contrato"
                        value={profile.startDateContract ? new Date(profile.startDateContract).toLocaleDateString('es-CL') : null}
                        icon={<Calendar className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <InfoField
                        label="Término del contrato"
                        value={profile.endDateContract
                            ? new Date(profile.endDateContract).toLocaleDateString('es-CL')
                            : 'No aplica (contrato indefinido)'}
                        icon={<Calendar className="size-4 text-muted-foreground shrink-0" />}
                    />
                </div>
            </CardContent>
        </Card>
    );
}