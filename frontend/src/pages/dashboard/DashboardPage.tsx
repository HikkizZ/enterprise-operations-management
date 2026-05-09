import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <p className="text-muted-foreground text-sm">Bienvenido,</p>
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
            <p className="text-muted-foreground text-sm">{user?.role}</p>
            <Button variant="outline" onClick={handleLogout}>
                Cerrar sesión
            </Button>
        </div>
    );
}