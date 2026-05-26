import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { EmployeeResponse, PersonalFormData } from '@/types/employee.types';
import { EditableTextField, ReadOnlyField } from './EditableFields';
import { formatPhone } from '@/utils/employeeUtils';

interface PersonalDataTabProps {
    employee: EmployeeResponse;
    isEditing: boolean;
    data: PersonalFormData;
    onChange: (field: keyof PersonalFormData, value: string) => void;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PersonalDataTab({ employee, isEditing, data, onChange }: PersonalDataTabProps) {
    return (
        <Card className="border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    Información Personal
                    {isEditing && <Badge variant="outline" className="ml-2 text-xs">Editando</Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableTextField
                        label="Nombres"
                        value={data.names}
                        isEditing={isEditing}
                        onChange={(v) => onChange('names', v)}
                    />
                    <EditableTextField
                        label="Apellido paterno"
                        value={data.paternalSurname}
                        isEditing={isEditing}
                        onChange={(v) => onChange('paternalSurname', v)}
                    />
                    <EditableTextField
                        label="Apellido materno"
                        value={data.maternalSurname || ''}
                        isEditing={isEditing}
                        onChange={(v) => onChange('maternalSurname', v)}
                    />
                    <ReadOnlyField label="RUT" value={employee.rut} icon={User} mono />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableTextField
                        label="Email Personal"
                        value={data.email}
                        isEditing={isEditing}
                        onChange={(v) => onChange('email', v)}
                        type="email"
                        icon={Mail}
                    />
                    <EditableTextField
                        label="Teléfono"
                        value={data.phoneNumber}
                        displayValue={formatPhone(data.phoneNumber)}
                        isEditing={isEditing}
                        onChange={(v) => onChange('phoneNumber', v)}
                        type="tel"
                        icon={Phone}
                        mono
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableTextField
                        label="Dirección"
                        value={data.address}
                        isEditing={isEditing}
                        onChange={(v) => onChange('address', v)}
                        icon={MapPin}
                    />
                    <EditableTextField
                        label="Contacto de emergencia"
                        value={data.emergencyContact}
                        displayValue={formatPhone(data.emergencyContact)}
                        isEditing={isEditing}
                        onChange={(v) => onChange('emergencyContact', v)}
                        type="tel"
                        icon={Phone}
                        mono
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableTextField
                        label="Fecha de nacimiento"
                        value={data.birthDate}
                        displayValue={formatDate(data.birthDate)}
                        isEditing={isEditing}
                        onChange={(v) => onChange('birthDate', v)}
                        type="date"
                        icon={Calendar}
                    />
                    <ReadOnlyField
                        label="Fecha de ingreso"
                        value={formatDate(employee.hireDate)}
                        icon={Calendar}
                    />
                </div>
            </CardContent>
        </Card>
    );
}