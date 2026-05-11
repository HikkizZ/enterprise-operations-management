import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getEmployeesApi } from '@/api/employee.api';
import { getStatusBadge, getInitials } from '@/utils/employeeUtils';
import CreateEmployeeModal from '@/components/employees/CreateEmployeeModal';
import { useAuth } from '@/context/AuthContext';
import { userRoles } from '@/types/auth.types';

export default function EmployeesPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');

    const isRRHH = user?.role === userRoles.RECURSOS_HUMANOS;

    const { data: employees = [], isLoading, isError } = useQuery({
        queryKey: ['employees', search],
        queryFn: () => getEmployeesApi({ name: search || undefined }),
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Empleados</h1>
                    <p className="text-sm text-muted-foreground">Gestiona el personal de la organización</p>
                </div>
                {isRRHH && (
                    <CreateEmployeeModal
                        trigger={
                            <Button className="gap-2">
                                <Plus className="size-4" />
                                Nuevo empleado
                            </Button>
                        }
                    />
                )}
            </div>

            <Card className="border border-border bg-card py-0">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                        {isLoading ? 'Cargando...' : `${employees.length} empleados registrados`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isError && (
                        <p className="px-6 py-4 text-sm text-destructive">Error al cargar los empleados.</p>
                    )}
                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {['Empleado', 'RUT', 'Cargo', 'Área', 'Estado', 'Ingreso', 'Acciones'].map((col) =>
                                        (
                                            <th
                                                key={col}
                                                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${col === 'Acciones' ? 'text-right' : 'text-left'}`}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="transition-colors hover:bg-muted/30">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-9">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                            {getInitials(emp.names, emp.paternalSurname)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-foreground">
                                                        {emp.names} {emp.paternalSurname}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-muted-foreground">
                                                {emp.rut}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                                                {emp.profile?.jobTitle ?? '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                                {emp.profile?.area ?? '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {emp.profile
                                                    ? getStatusBadge(emp.profile.status)
                                                    : <Badge variant="secondary">Sin perfil</Badge>
                                                }
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(emp.hireDate).toLocaleDateString('es-CL')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link to={`/employees/${emp.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Eye className="size-4" />
                                                        Ver
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {employees.length === 0 && (
                                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No se encontraron empleados.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}