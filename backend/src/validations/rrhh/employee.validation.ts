import { z } from 'zod';
import { createRutSchema } from 'rut-kit/zod';
import { estadoLaboral, type EstadoLaboral } from '../../types/rrhh/employeeProfile.types.js';

const rutSchema = createRutSchema({
    messages: {
        required: 'El RUT es obligatorio',
        invalidFormat: 'El RUT debe tener un formato válido (ej: 12345678-9)',
        invalidCheckDigit: 'El dígito verificador del RUT es incorrecto',
    },
    outputFormat: 'formatted',
});

const phoneSchema = z.string()
    .regex(/^\+?[\d]{9,15}$/, 'El teléfono debe contener entre 9 y 15 dígitos y puede incluir el símbolo +');

const namesSchema = (fieldName: string) =>
    z.string()
        .min(2, `${fieldName} debe tener al menos 2 caracteres`)
        .max(100, `${fieldName} debe tener como máximo 100 caracteres`)
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, `${fieldName} solo puede contener letras y espacios`);

const estadoLaboralValues = Object.values(estadoLaboral) as [EstadoLaboral, ...EstadoLaboral[]];

/* Params */
export const employeeIdParamSchema = z.object({
    id: z.uuid('El ID del empleado debe ser un UUID válido'),
});

/* Query Params */
export const employeeQuerySchema = z.object({
    page: z.coerce.number().int().positive('La página debe ser un número entero positivo').optional(),
    limit: z.coerce.number().int().positive('El límite debe ser un número entero positivo').max(100, 'El límite máximo es 100').optional(),
    rut: rutSchema.optional(),
    name: z.string().min(1, 'El nombre debe tener al menos 1 carácter').max(200).optional(),
    status: z.enum(estadoLaboralValues, { error: 'El estado laboral no es válido' }).optional(),
    includeTerminated: z.coerce.boolean().optional(),
});

/* Create */
export const createEmployeeSchema = z.object({
    rut: rutSchema,
    names: namesSchema('Los nombres'),
    paternalSurname: namesSchema('El apellido paterno'),
    maternalSurname: namesSchema('El apellido materno').optional(),
    birthDate: z.coerce
        .date({ error: 'La fecha de nacimiento debe ser una fecha válida' })
        .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
        .optional(),
    phoneNumber: phoneSchema.optional(),
    email: z.email('El correo personal debe ser un correo electrónico válido'),
    emergencyContact: phoneSchema.optional(),
    address: z.string()
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(255, 'La dirección debe tener como máximo 255 caracteres')
        .optional(),
    hireDate: z.coerce.date({ error: 'La fecha de ingreso debe ser una fecha válida' }),
});

/* Update */
export const updateEmployeeSchema = z.object({
    names: namesSchema('Los nombres').optional(),
    paternalSurname: namesSchema('El apellido paterno').optional(),
    maternalSurname: z.union([namesSchema('El apellido materno'), z.null()]).optional(),
    birthDate: z.union([
        z.coerce
            .date({ error: 'La fecha de nacimiento debe ser una fecha válida' })
            .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro'),
        z.null(),
    ]).optional(),
    phoneNumber: z.union([phoneSchema, z.null()]).optional(),
    email: z.email('El correo personal debe ser un correo electrónico válido').optional(),
    emergencyContact: z.union([phoneSchema, z.null()]).optional(),
    address: z.union([
        z.string()
            .min(5, 'La dirección debe tener al menos 5 caracteres')
            .max(255, 'La dirección no puede exceder los 255 caracteres'),
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
});

export const updateEmployeeSelfSchema = z.object({
    email: z.email('El correo personal debe ser un correo electrónico válido').optional(),
    phoneNumber: z.union([phoneSchema, z.null()]).optional(),
    emergencyContact: z.union([phoneSchema, z.null()]).optional(),
    address: z.union([
        z.string()
            .min(5, 'La dirección debe tener al menos 5 caracteres')
            .max(255, 'La dirección no puede exceder los 255 caracteres'),
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
});

/* Terminate */
export const terminateEmployeeSchema = z.object({
    reason: z.string()
        .min(3, 'El motivo de desvinculación debe tener al menos 3 caracteres')
        .max(500, 'El motivo de desvinculación no puede exceder los 500 caracteres'),
});

/* Reactivate */
export const reactivateEmployeeSchema = z.object({
    names: namesSchema('Los nombres').optional(),
    paternalSurname: namesSchema('El apellido paterno').optional(),
    maternalSurname: namesSchema('El apellido materno').optional(),
    phoneNumber: z.union([phoneSchema, z.null()]).optional(),
    address: z.union([
        z.string()
            .min(5, 'La dirección debe tener al menos 5 caracteres')
            .max(255, 'La dirección no puede exceder los 255 caracteres'),
        z.null(),
    ]).optional(),
    reactivationReason: z.string()
        .min(3, 'El motivo de reactivación debe tener al menos 3 caracteres')
        .max(1000, 'El motivo de reactivación no puede exceder los 1000 caracteres'),
});

/* Inferred Types */
export type EmployeeIdParam = z.infer<typeof employeeIdParamSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
export type CreateEmployeeBody = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeBody = z.infer<typeof updateEmployeeSchema>;
export type UpdateEmployeeSelfBody = z.infer<typeof updateEmployeeSelfSchema>;
export type TerminateEmployeeBody = z.infer<typeof terminateEmployeeSchema>;
export type ReactivateEmployeeBody = z.infer<typeof reactivateEmployeeSchema>;