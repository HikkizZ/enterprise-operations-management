import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, UserCog, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { userRoles, type UserRole } from '@/types/auth.types';
import UserMenu from '@/components/UserMenu';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    roles?: UserRole[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Empleados', href: '/employees', icon: Users, roles: [userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA] },
    { name: 'Licencias', href: '/leaves', icon: FileText, roles: [userRoles.RECURSOS_HUMANOS, userRoles.GERENCIA] },
    {
        name: 'Usuarios', href: '/users', icon: UserCog, roles: [userRoles.SUPER_ADMINISTRADOR, userRoles.ADMINISTRADOR]
    },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const visibleNav = navigation.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        if (user.role === userRoles.SUPER_ADMINISTRADOR || user.role === userRoles.ADMINISTRADOR) return true;
        return item.roles.includes(user.role);
    });

    return (
        <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-background">
            <div className="flex h-16 items-center gap-3 px-6">
                <div>
                    <img src="/favicon.svg" alt="EOMS" className="size-9" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground">EOMS</h1>
                    <p className="text-xs text-muted-foreground">Gestión Operacional</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleNav.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? location.pathname === item.href
                        : location.pathname.startsWith(item.href);
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={cn(
                                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn(
                                'size-5 shrink-0 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            <Separator />

            <div className="p-4 space-y-2">
                <UserMenu />
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="size-4" />
                    Cerrar sesión
                </Button>
            </div>
        </aside>
    );
}