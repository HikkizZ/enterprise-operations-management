import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from './PasswordInput';
import LoginButton from './LoginButton';

const loginSchema = z.object({
    email: z.email({ message: 'Correo electrónico inválido' }),
    password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError('root', { message });
        }
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
            {errors.root && (<p className="text-sm text-destructive text-center">{errors.root.message}</p>)}
            <LoginButton isLoading={isSubmitting} />
        </form>
    )
}