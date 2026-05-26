import { useAuth } from '@/context/AuthContext';
import { userRoles, type UserRole } from '../types/auth.types';

export function useRole() {
    const { user } = useAuth();
    const role = user?.role;

    const isAdmin = role === userRoles.ADMINISTRADOR;
    const isSuperAdmin = role === userRoles.SUPER_ADMINISTRADOR;
    const isRRHH = role === userRoles.RECURSOS_HUMANOS;
    const isGerencia = role === userRoles.GERENCIA;
    const isMantenciones = role === userRoles.MANTENCIONES_MAQUINARIA;
    const isFinanzas = role === userRoles.FINANZAS;
    const isArriendo = role === userRoles.ARRIENDO;
    const isMecanico = role === userRoles.MECANICO;
    const isVentas = role === userRoles.VENTAS;

    const can = (roles: UserRole[]) => isAdmin || (!!role && roles.includes(role));

    return { role, isAdmin, isSuperAdmin, isRRHH, isGerencia, isMantenciones, isFinanzas, isArriendo, isMecanico, isVentas, can };
}