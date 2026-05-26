import { Briefcase, Building2, Wallet, Shield, Calendar, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { EmployeeResponse, WorkFormData } from '@/types/employee.types';
import { tipoContrato, tipoJornada, fondoAFP, previsionSalud, seguroCesantia } from '@/types/employee.types';
import { getStatusBadge } from '@/utils/employeeUtils';
import { EditableTextField, EditableSelectField, ReadOnlyField } from './EditableFields';
import { userRoles } from '@/types/auth.types';

const contratoOptions = Object.values(tipoContrato);
const jornadaOptions = Object.values(tipoJornada);
const afpOptions = Object.values(fondoAFP);
const saludOptions = Object.values(previsionSalud);
const cesantiaOptions = Object.values(seguroCesantia);
const roleOptions = Object.values(userRoles).filter(r => r !== userRoles.ADMINISTRADOR && r !== userRoles.SUPER_ADMINISTRADOR);

interface WorkProfileTabProps {
    employee: EmployeeResponse;
    isEditing: boolean;
    data: WorkFormData;
    onChange: (field: keyof WorkFormData, value: string) => void;
    role: string;
    onRoleChange: (role: string) => void;
    canEditRole: boolean;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WorkProfileTab({ employee, isEditing, data, onChange, role, onRoleChange, canEditRole }: WorkProfileTabProps) {
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
                    {isEditing && <Badge variant="outline" className="ml-2 text-xs">Editando</Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Estado</span>
                    {getStatusBadge(profile.status)}
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-3">
                    {canEditRole ? (
                        <EditableSelectField
                            label="Rol del sistema"
                            value={role}
                            isEditing={isEditing}
                            onChange={onRoleChange}
                            options={roleOptions}
                        />
                    ) : (
                        <ReadOnlyField
                            label="Rol del sistema"
                            value={role}
                        />
                    )}
                    <EditableTextField
                        label="Cargo"
                        value={data.jobTitle}
                        isEditing={isEditing}
                        onChange={(v) => onChange('jobTitle', v)}
                        icon={Briefcase}
                    />
                    <EditableTextField
                        label="Área"
                        value={data.area}
                        isEditing={isEditing}
                        onChange={(v) => onChange('area', v)}
                        icon={Building2}
                    />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <EditableSelectField
                        label="Tipo de contrato"
                        value={data.contractType}
                        isEditing={isEditing}
                        onChange={(v) => onChange('contractType', v)}
                        options={contratoOptions}
                    />
                    <EditableSelectField
                        label="Jornada"
                        value={data.employmentType}
                        isEditing={isEditing}
                        onChange={(v) => onChange('employmentType', v)}
                        options={jornadaOptions}
                    />
                    <EditableTextField
                        label="Sueldo base"
                        value={data.baseSalary}
                        displayValue={data.baseSalary ? `$${Number(data.baseSalary).toLocaleString('es-CL')}` : ''}
                        isEditing={isEditing}
                        onChange={(v) => onChange('baseSalary', v)}
                        type="number"
                        icon={Wallet}
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-3">
                    <EditableSelectField
                        label="AFP"
                        value={data.fondoAFP}
                        isEditing={isEditing}
                        onChange={(v) => onChange('fondoAFP', v)}
                        options={afpOptions}
                        icon={Shield}
                    />
                    <EditableSelectField
                        label="Previsión de salud"
                        value={data.previsionSalud}
                        isEditing={isEditing}
                        onChange={(v) => onChange('previsionSalud', v)}
                        options={saludOptions}
                        icon={Heart}
                    />
                    <EditableSelectField
                        label="Seguro de cesantía"
                        value={data.seguroCesantia}
                        isEditing={isEditing}
                        onChange={(v) => onChange('seguroCesantia', v)}
                        options={cesantiaOptions}
                        icon={Shield}
                    />
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                    <EditableTextField
                        label="Inicio del contrato"
                        value={data.startDateContract}
                        displayValue={formatDate(data.startDateContract)}
                        isEditing={isEditing}
                        onChange={(v) => onChange('startDateContract', v)}
                        type="date"
                        icon={Calendar}
                    />
                    {data.contractType === tipoContrato.INDEFINIDO || !data.contractType ? (
                        <ReadOnlyField
                            label="Término del contrato"
                            value="No aplica (indefinido)"
                            icon={Calendar}
                        />
                    ) : (
                        <EditableTextField
                            label="Término del contrato"
                            value={data.endDateContract}
                            displayValue={formatDate(data.endDateContract)}
                            isEditing={isEditing}
                            onChange={(v) => onChange('endDateContract', v)}
                            type="date"
                            icon={Calendar}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}