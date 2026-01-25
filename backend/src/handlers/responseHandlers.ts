import type { Response } from 'express';

/* Manejo estandarizado de respuestas exitosas */
export function handleSuccess<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    return res.status(statusCode).json({
        status: 'success',
        message,
        ...(data !== undefined && { data })
    });
}

/* Manejo estandarizado de respuestas de errores del cliente */
export function handleErrorClient<T = unknown>(res: Response, statusCode: number, message: string, details: T): Response {
    return res.status(statusCode).json({
        status: 'error',
        message,
        ...(details !== undefined && { details })
    });
}

/* Manejo estandarizado de respuestas de errores del servidor */
export function handleErrorServer(res: Response, message = 'Error interno del servidor'): Response {
    return res.status(500).json({
        status: 'error',
        message
    });
}