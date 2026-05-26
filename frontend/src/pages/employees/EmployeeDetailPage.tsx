import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Briefcase, Clock, FileText, Mail, Phone, Pencil, Save, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEmployeeByIdApi, updateEmployeeApi, updateProfileApi } from '@/api/employee.api';
import { getInitials, getStatusBadge } from '@/utils/employeeUtils';
import { useRole } from '@/hooks/useRole';
import { userRoles } from '@/types/auth.types';
import type {
    EmployeeResponse,
    PersonalFormData,
    WorkFormData,
    UpdateEmployeeBody,
    UpdateProfileBody,
    FondoAFP,
    TipoPrevisionSalud,
    SeguroCesantia,
    TipoJornada,
    TipoContrato,
} from '@/types/employee.types';
import PersonalDataTab from '@/components/employees/PersonalDataTab';
import WorkProfileTab from '@/components/employees/WorkProfileTab';
import HistoryTab from '@/components/employees/HistoryTab';
import LeavesTab from '@/components/employees/LeavesTab';

function buildPersonalForm(e: EmployeeResponse): PersonalFormData {
    return {
        names: e.names,
        paternalSurname: e.paternalSurname,
        maternalSurname: e.maternalSurname ?? '',
        birthDate: e.birthDate ?? '',
        email: e.email,
        phoneNumber: e.phoneNumber ?? '',
        emergencyContact: e.emergencyContact ?? '',
        address: e.address ?? '',
    };
}

function buildWorkForm(e: EmployeeResponse): WorkFormData {
    const p = e.profile;
    return {
        jobTitle: p?.jobTitle ?? '',
        area: p?.area ?? '',
        baseSalary: p?.baseSalary != null ? String(p.baseSalary) : '',
        employmentType: p?.employmentType ?? '',
        contractType: p?.contractType ?? '',
        fondoAFP: p?.fondoAFP ?? '',
        previsionSalud: p?.previsionSalud ?? '',
        seguroCesantia: p?.seguroCesantia ?? '',
    };
}

export default function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: employee, isLoading, isError } = useQuery({
        queryKey: ['employee', id],
        queryFn: () => getEmployeeByIdApi(id!),
        enabled: !!id,
    });

    if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Cargando empleado...</div>;
    if (isError || !employee) return <div className="p-6 text-sm text-destructive">No se pudo cargar el
        empleado.</div>;

    return <EmployeeDetailContent employee={employee} onBack={() => navigate('/employees')} />;
}

function EmployeeDetailContent({ employee, onBack }: { employee: EmployeeResponse; onBack: () => void }) {
    const queryClient = useQueryClient();
    const { can } = useRole();

    const [isEditing, setIsEditing] = useState(false);
    const [personalData, setPersonalData] = useState<PersonalFormData>(() => buildPersonalForm(employee));
    const [workData, setWorkData] = useState<WorkFormData>(() => buildWorkForm(employee));
    const [saveError, setSaveError] = useState<string | null>(null);

    const updateEmployeeMutation = useMutation({
        mutationFn: (body: UpdateEmployeeBody) => updateEmployeeApi(employee.id, body),
    });
    const updateProfileMutation = useMutation({
        mutationFn: (body: UpdateProfileBody) => updateProfileApi(employee.id, body),
    });

    const isSaving = updateEmployeeMutation.isPending || updateProfileMutation.isPending;
    const canEdit = can([userRoles.RECURSOS_HUMANOS]);

    const handlePersonalChange = (field: keyof PersonalFormData, value: string) =>
        setPersonalData(prev => ({ ...prev, [field]: value }));

    const handleWorkChange = (field: keyof WorkFormData, value: string) =>
        setWorkData(prev => ({ ...prev, [field]: value }));

    const handleCancel = () => {
        setPersonalData(buildPersonalForm(employee));
        setWorkData(buildWorkForm(employee));
        setSaveError(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaveError(null);
        try {
            const personalPayload: UpdateEmployeeBody = {
                names: personalData.names || undefined,
                paternalSurname: personalData.paternalSurname || undefined,
                maternalSurname: personalData.maternalSurname || null,
                birthDate: personalData.birthDate || null,
                email: personalData.email || undefined,
                phoneNumber: personalData.phoneNumber || null,
                emergencyContact: personalData.emergencyContact || null,
                address: personalData.address || null,
            };

            const tasks: Promise<unknown>[] = [
                updateEmployeeMutation.mutateAsync(personalPayload),
            ];

            if (employee.profile) {
                const profilePayload: UpdateProfileBody = {
                    jobTitle: workData.jobTitle || undefined,
                    area: workData.area || undefined,
                    baseSalary: workData.baseSalary ? Number(workData.baseSalary) : undefined,
                    employmentType: (workData.employmentType as TipoJornada) || undefined,
                    contractType: (workData.contractType as TipoContrato) || undefined,
                    fondoAFP: (workData.fondoAFP as FondoAFP) || null,
                    previsionSalud: (workData.previsionSalud as TipoPrevisionSalud) || null,
                    seguroCesantia: (workData.seguroCesantia as SeguroCesantia) || null,
                };
                tasks.push(updateProfileMutation.mutateAsync(profilePayload));
            }

            await Promise.all(tasks);
            queryClient.invalidateQueries({ queryKey: ['employee', employee.id] });
            setIsEditing(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios');
        }
    };

    const displayName = isEditing
        ? `${personalData.names} ${personalData.paternalSurname}${personalData.maternalSurname ? ` ${personalData.maternalSurname}` : ''}`.trim()
        : `${employee.names} ${employee.paternalSurname}${employee.maternalSurname ? ` ${employee.maternalSurname}` : ''}`;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} disabled={isEditing}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Detalle del Empleado</h1>
                    <p className="text-sm text-muted-foreground">{employee.rut}</p>
                </div>
                {isEditing ? (
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                <X className="mr-2 size-4" />
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving
                                    ? <Loader2 className="mr-2 size-4 animate-spin" />
                                    : <Save className="mr-2 size-4" />}
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                        {saveError && <p className="text-xs text-destructive">{saveError}</p>}
                    </div>
                ) : canEdit ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 size-4" />
                        Editar
                    </Button>
                ) : null}
            </div>

            {/* Tarjeta de perfil */}
            <Card className="border border-border bg-card">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <Avatar className="size-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                {isEditing
                                    ? getInitials(personalData.names, personalData.paternalSurname)
                                    : getInitials(employee.names, employee.paternalSurname)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                                {employee.profile && getStatusBadge(employee.profile.status)}
                            </div>
                            {employee.profile && (
                                <p className="text-muted-foreground">
                                    {isEditing ? workData.jobTitle || '—' : employee.profile.jobTitle ?? '—'}
                                </p>
                            )}
                            {employee.profile && (
                                <p className="text-sm text-muted-foreground">
                                    {isEditing ? workData.area || '—' : employee.profile.area ?? '—'}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="size-4" />
                                <span>{employee.email}</span>
                            </div>
                            {employee.phoneNumber && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="size-4" />
                                    <span>{employee.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="personal" className="gap-2">
                        <User className="size-4" />
                        <span className="hidden sm:inline">Datos personales</span>
                        <span className="sm:hidden">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="work" className="gap-2">
                        <Briefcase className="size-4" />
                        <span className="hidden sm:inline">Perfil laboral</span>
                        <span className="sm:hidden">Laboral</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <Clock className="size-4" />
                        <span className="hidden sm:inline">Historial</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaves" className="gap-2">
                        <FileText className="size-4" />
                        <span className="hidden sm:inline">Licencias</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <PersonalDataTab
                        employee={employee}
                        isEditing={isEditing}
                        data={personalData}
                        onChange={handlePersonalChange}
                    />
                </TabsContent>
                <TabsContent value="work">
                    <WorkProfileTab
                        employee={employee}
                        isEditing={isEditing}
                        data={workData}
                        onChange={handleWorkChange}
                    />
                </TabsContent>
                <TabsContent value="history">
                    <HistoryTab employeeId={employee.id} />
                </TabsContent>
                <TabsContent value="leaves">
                    <LeavesTab employeeId={employee.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}