import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createEmployeeApi } from '@/api/employee.api';
import type { CreateEmployeeBody, CreateEmployeeResult } from '@/types/employee.types';

const schema = z.object({
    rut: z.string().min(1, 'El RUT es requerido'),
    names: z.string().min(1, 'Los nombres son requeridos'),
    paternalSurname: z.string().min(1, 'El apellido paterno es requerido'),
    email: z.email('Email inválido'),
    hireDate: z.string().min(1, 'La fecha de ingreso es requerida'),
});

type FormValues = z.infer<typeof schema>;

function FormStep({ onSuccess, onCancel }: { onSuccess: (result: CreateEmployeeResult) => void; onCancel: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: (body: CreateEmployeeBody) => createEmployeeApi(body),
        onSuccess,
    });

    return (
        <>
            <DialogHeader>
                <DialogTitle>Nuevo empleado</DialogTitle>
                <DialogDescription>
                    Ingresa los datos básicos. Las credenciales se generarán automáticamente.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input id="rut" placeholder="12.345.678-9" className="font-mono" {...register('rut')} />
                    {errors.rut && <p className="text-xs text-destructive">{errors.rut.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="names">Nombres</Label>
                    <Input id="names" placeholder="Ej: Juan Pablo" {...register('names')} />
                    {errors.names && <p className="text-xs text-destructive">{errors.names.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="paternalSurname">Apellido paterno</Label>
                    <Input id="paternalSurname" placeholder="Ej: Pérez" {...register('paternalSurname')} />
                    {errors.paternalSurname && <p className="text-xs text-destructive">{errors.paternalSurname.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email personal</Label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="hireDate">Fecha de ingreso</Label>
                    <Input id="hireDate" type="date" {...register('hireDate')} />
                    {errors.hireDate && <p className="text-xs text-destructive">{errors.hireDate.message}</p>}
                </div>
                {mutation.isError && (
                    <p className="text-xs text-destructive">{(mutation.error as Error).message}</p>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                        Crear empleado
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}

function CredentialsStep({ result, onClose }: { result: CreateEmployeeResult; onClose: () => void }) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (field: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-status-active">
                    <Check className="size-5" />
                    Empleado creado
                </DialogTitle>
                <DialogDescription>
                    {result.emailSent
                        ? 'Las credenciales fueron enviadas por correo al empleado.'
                        : 'No se pudo enviar el correo — anota las credenciales manualmente.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Correo corporativo</Label>
                            <div className="flex items-center gap-2">
                                <Input value={result.corporateEmail} readOnly className="font-mono bg-background" />
                                <Button variant="outline" size="icon" onClick={() => handleCopy('email', result.corporateEmail)}>
                                    {copied === 'email' ? <Check className="size-4 text-status-active" /> : <Copy className="size-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contraseña temporal</Label>
                            <div className="flex items-center gap-2">
                                <Input value={result.tempPassword} readOnly className="font-mono bg-background" />
                                <Button variant="outline" size="icon" onClick={() => handleCopy('password', result.tempPassword)}>
                                    {copied === 'password' ? <Check className="size-4 text-status-active" /> : <Copy className="size-4" />}
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            El empleado deberá cambiar la contraseña en su primer inicio de sesión.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <Button onClick={onClose} className="w-full">Cerrar</Button>
            </DialogFooter>
        </>
    );
}

interface CreateEmployeeModalProps {
    trigger: React.ReactNode;
}

export default function CreateEmployeeModal({ trigger }: CreateEmployeeModalProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<CreateEmployeeResult | null>(null);

    const handleSuccess = (data: CreateEmployeeResult) => {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: ['employees'] });
    };

    const handleClose = () => {
        setIsOpen(false);
        setResult(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {result
                    ? <CredentialsStep result={result} onClose={handleClose} />
                    : <FormStep onSuccess={handleSuccess} onCancel={handleClose} />
                }
            </DialogContent>
        </Dialog>
    );
}