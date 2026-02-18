import type { Request, Response, NextFunction } from 'express';
import type { RequestHandler } from 'express';

export function verifyRole(requiredRoles: string | string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as { role: string } | undefined;

        // Check if user is authenticated
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            return;
        }

        // SuperAdministrador has all permissions
        if (user.role === 'SuperAdministrador') {
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