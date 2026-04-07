import { z } from 'zod';
import {
    tipoContrato, type TipoContrato,
    tipoJornada, type TipoJornada,
    fondoAFP, type FondoAFP,
    previsionSalud, type TipoPrevisionSalud,
    seguroCesantia, type SeguroCesantia,
} from '../../types/rrhh/employeeProfile.types.js';

const tipoContratoValues = Object.values(tipoContrato) as [TipoContrato, ...TipoContrato[]];
const tipoJornadaValues = Object.values(tipoJornada) as [TipoJornada, ...TipoJornada[]];
const fondoAFPValues = Object.values(fondoAFP) as [FondoAFP, ...FondoAFP[]];
const previsionSaludValues = Object.values(previsionSalud) as [TipoPrevisionSalud, ...TipoPrevisionSalud[]];
const cesantiaValues = Object.values(seguroCesantia) as [SeguroCesantia, ...SeguroCesantia[]];

/* Update Profile */
export const updateProfileSchema = z.object({
    jobTitle: z.string()
        .min(2, 'El cargo debe tener al menos 2 caracteres')
        .max(100, 'El cargo no puede exceder los 100 caracteres')
        .optional(),
    area: z.string()
        .min(2, 'El área debe tener al menos 2 caracteres')
        .max(100, 'El área no puede exceder los 100 caracteres')
        .optional(),
    contractType: z.enum(tipoContratoValues, { error: () => ({ message: 'El tipo de contrato no es válido' }) }).optional(),
    employmentType: z.enum(tipoJornadaValues, { error: () => ({ message: 'El tipo de jornada no es válido' }) }).optional(),
    baseSalary: z.number().positive('El sueldo base debe ser mayor a 0').optional(),
    previsionSalud: z.union([
        z.enum(previsionSaludValues, { error: () => ({ message: 'La previsión de salud no es válida' }) }),
        z.null(),
    ]).optional(),
    fondoAFP: z.union([
        z.enum(fondoAFPValues, { error: () => ({ message: 'El fondo de AFP no es válido' }) }),
        z.null(),
    ]).optional(),
    seguroCesantia: z.union([
        z.enum(cesantiaValues, { error: () => ({ message: 'El seguro de cesantía no es válido' }) }),
        z.null(),
    ]).optional(),
    startDateContract: z.union([
        z.coerce.date({ error: 'La fecha de inicio de contrato debe ser una fecha válida' }),
        z.null(),
    ]).optional(),
    endDateContract: z.union([
        z.coerce.date({ error: 'La fecha de término de contrato debe ser una fecha válida' }),
        z.null(),
    ]).optional(),
}).superRefine((data, ctx) => {
    const hasAtLeastOne = Object.values(data).some(v => v !== undefined);
    if (!hasAtLeastOne) {
        ctx.addIssue({
            code: 'custom',
            message: 'Se debe proporcionar al menos un campo para actualizar',
        });
    }

    // Contrato indefinido no debe tener fecha de término
    if (data.contractType === tipoContrato.INDEFINIDO && data.endDateContract != null) {
        ctx.addIssue({
            code: 'custom',
            path: ['endDateContract'],
            message: 'Un contrato indefinido no debe tener fecha de término',
        });
    }

    // startDate debe ser anterior a endDate si ambos están presentes
    if (data.startDateContract != null && data.endDateContract != null) {
        if (data.startDateContract >= data.endDateContract) {
            ctx.addIssue({
                code: 'custom',
                path: ['endDateContract'],
                message: 'La fecha de finalización de contrato debe ser anterior a la fecha de inicio de contrato',
            });
        }
    }
});

/* Inferred Types */
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;