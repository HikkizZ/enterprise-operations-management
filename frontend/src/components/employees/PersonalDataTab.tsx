import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { EmployeeResponse } from '@/types/employee.types';

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

interface PersonalDataTabProps {
    employee: EmployeeResponse;
}

export default function PersonalDataTab({ employee }: PersonalDataTabProps) {
    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    Información Personal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField label="Nombres" value={employee.names} />
                    <InfoField label="Apellido paterno" value={employee.paternalSurname} />
                    <InfoField label="Apellido materno" value={employee.maternalSurname} />
                    <InfoField label="RUT" value={employee.rut} mono />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField
                        label="Email personal"
                        value={employee.email}
                        icon={<Mail className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <InfoField
                        label="Teléfono"
                        value={employee.phoneNumber}
                        mono
                        icon={<Phone className="size-4 text-muted-foreground shrink-0" />}
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField
                        label="Dirección"
                        value={employee.address}
                        icon={<MapPin className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <InfoField
                        label="Contacto de emergencia"
                        value={employee.emergencyContact}
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <InfoField
                        label="Fecha de nacimiento"
                        value={employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('es-CL') : null}
                        icon={<Calendar className="size-4 text-muted-foreground shrink-0" />}
                    />
                    <InfoField
                        label="Fecha de ingreso"
                        value={new Date(employee.hireDate).toLocaleDateString('es-CL')}
                        icon={<Calendar className="size-4 text-muted-foreground shrink-0" />}
                    />
                </div>
            </CardContent>
        </Card>
    );
}