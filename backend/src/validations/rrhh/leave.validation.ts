import { z } from 'zod';
import { tipoSolicitud, type TipoSolicitud } from '../../types/rrhh/leave.types.js';

const tipoSolicitudValues = Object.values(tipoSolicitud) as [TipoSolicitud, ...TipoSolicitud[]];

/* Params */
export const leaveIdParamSchema = z.object({
    leaveId: z.uuid('El ID de la solicitud de permiso debe ser un UUID válido'),
});

/* Create Leave */
export const createLeaveSchema = z.object({
    type: z.enum(tipoSolicitudValues, { error: 'El tipo de solicitud no es válido' }),
    startDate: z.coerce.date({ error: 'La fecha de inicio debe ser una fecha válida' }),
    endDate: z.coerce.date({ error: 'La fecha de término debe ser una fecha válida' }),
    reason: z.string()
        .min(10, 'La razón debe tener al menos 10 caracteres')
        .max(500, 'La razón no puede exceder los 500 caracteres'),
}).superRefine((data, ctx) => {
    if (data.startDate >= data.endDate) {
        ctx.addIssue({
            code: 'custom',
            path: ['endDate'],
            message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        });
    }
});

/* Review Leave */
export const reviewLeaveSchema = z.object({
    status: z.enum(['Aprobada', 'Rechazada'], { error: 'El estado debe ser Aprobada o Rechazada' }),
    comments: z.string()
        .max(500, 'Los comentarios no puede exceder los 500 caracteres')
        .optional(),
});

/* Inferred types */
export type LeaveIdParam = z.infer<typeof leaveIdParamSchema>;
export type CreateLeaveBody = z.infer<typeof createLeaveSchema>;
export type ReviewLeaveBody = z.infer<typeof reviewLeaveSchema>;