import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, Sun, Moon, ChevronUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { userRoles } from "@/types/auth.types";

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function UserMenu() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isSuperAdmin = user?.role === userRoles.SUPER_ADMINISTRADOR;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none">
                    <Avatar className="size-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user ? getInitials(user.name) : '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                    <ChevronUp className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? '' : 'rotate-180'}`} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                {!isSuperAdmin && (
                    <>
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                            <User className="size-4" />
                            Mi perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/my-leaves')}>
                            <FileText className="size-4" />
                            Mis licencias
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem onClick={toggleTheme}>
                    {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}