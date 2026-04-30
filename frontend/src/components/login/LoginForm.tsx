import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import LoginButton from './LoginButton';

const loginSchema = z.object({
    email: z.email({ message: 'Correo electrónico inválido' }),
    password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        console.log('Datos del formulario:', data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Ingresa tu correo electrónico"
                        className="h-11 bg-input border-border"
                        {...register('email')}
                    />
                    {errors.email && (<p className="text-sm text-destructive">{errors.email.message}</p>)}
                </div>
                <PasswordInput registration={register('password')} />
                {errors.password && (<p className="text-sm text-destructive">{errors.password.message}</p>)}
            </div>
            <LoginButton />
        </form>
    )
}