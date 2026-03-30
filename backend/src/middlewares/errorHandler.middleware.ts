import type { Request, Response, NextFunction } from 'express';
import { handleErrorServer } from '../handlers/responseHandlers.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    console.error('💥 Error no manejado:', err);

    const menssage = process.env.NODE_ENV === 'development'
    ? (err instanceof Error ? err.message : String(err))
    : 'Error interno del servidor';

    handleErrorServer(res, menssage);
}