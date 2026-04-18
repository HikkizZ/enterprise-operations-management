import type { Request, Response, NextFunction } from 'express';
import type { RequestHandler } from 'express';
import { userRoles, type UserRole } from '../types/user.types.js';

export function verifyRole(requiredRoles: UserRole | UserRole[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
       const user = req.user as { role: UserRole } | undefined;

        // Check if user is authenticated
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            return;
        }

        // SuperAdministrador and Administrador have all permissions
        if (user.role === userRoles.SUPER_ADMINISTRADOR || user.role === userRoles.ADMINISTRADOR) {
            next();
            return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!roles.includes(user.role)) {
            res.status(403).json({ status: 'error', message: 'Acceso denegado: permisos insuficientes' });
            return;
        }
        next();
    }
};

export function verifySelfOrRole(requiredRoles: UserRole | UserRole[], paramName: string = 'id'): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as { id: string; role: UserRole; employee: { id: string } | null } | undefined;

        if (!user) {
            res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            return;
        }

        if (user.role === userRoles.SUPER_ADMINISTRADOR || user.role === userRoles.ADMINISTRADOR) {
            next();
            return;
        }

        if (user.employee?.id === req.params[paramName]) {
            next();
            return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!roles.includes(user.role)) {
            res.status(403).json({ status: 'error', message: 'Acceso denegado: permisos insuficientes' });
            return;
        }

        next();
    }
}