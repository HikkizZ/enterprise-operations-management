import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Briefcase, Clock, FileText, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEmployeeByIdApi } from '@/api/employee.api';
import { getInitials, getStatusBadge } from '@/utils/employeeUtils';
import PersonalDataTab from '@/components/employees/PersonalDataTab';
import WorkProfileTab from '@/components/employees/WorkProfileTab';
import HistoryTab from '@/components/employees/HistoryTab';
import LeavesTab from '@/components/employees/LeavesTab';

export default function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: employee, isLoading, isError } = useQuery({
        queryKey: ['employee', id],
        queryFn: () => getEmployeeByIdApi(id!),
        enabled: !!id,
    });

    if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Cargando empleado...</div>;
    if (isError || !employee) return <div className="p-6 text-sm text-destructive">No se pudo cargar el empleado.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Detalle del Empleado</h1>
                    <p className="text-sm text-muted-foreground">{employee.rut}</p>
                </div>
            </div>

            <Card className="border border-border bg-card">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <Avatar className="size-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                {getInitials(employee.names, employee.paternalSurname)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-foreground">
                                    {employee.names} {employee.paternalSurname}{employee.maternalSurname ? ` ${employee.maternalSurname}` : ''}
                                </h2>
                                {employee.profile && getStatusBadge(employee.profile.status)}
                            </div>
                            {employee.profile && (
                                <p className="text-muted-foreground">{employee.profile.jobTitle ?? '—'}</p>
                            )}
                            {employee.profile && (
                                <p className="text-sm text-muted-foreground">{employee.profile.area ?? '—'}</p>
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

                <TabsContent value="personal"><PersonalDataTab employee={employee} /></TabsContent>
                <TabsContent value="work"><WorkProfileTab employee={employee} /></TabsContent>
                <TabsContent value="history"><HistoryTab employeeId={employee.id} /></TabsContent>
                <TabsContent value="leaves"><LeavesTab employeeId={employee.id} /></TabsContent>
            </Tabs>
        </div>
    );
}