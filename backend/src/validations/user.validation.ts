import { z } from 'zod';
import { createRutSchema } from 'rut-kit/zod';
import { userRoles } from '../types/user.types.js';
import { configEnv } from '../config/configEnv.js';

const allowedCorporateEmailDomains = configEnv.domains.allowedCorporateEmailDomains;

const isAllowedCorporateEmailDomain = (value: string) => {
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    return allowedCorporateEmailDomains.includes(domain);
}

const rutSchema = createRutSchema({
    messages: {
        required: 'El RUT es obligatorio',
        invalidFormat: 'El RUT debe tener un formato válido',
        invalidCheckDigit: 'El dígito verificador del RUT es incorrecto',
    },
    outputFormat: 'formatted',
});

/* Query Params para buscar usuarios */
export const userQuerySchema = z.object({
    id: z.uuid('El ID debe ser un UUID válido').optional(),
    corporateEmail: z.email('El correo corporativo debe ser un correo electrónico válido').optional(),
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no debe exceder los 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .optional(),
    rut: rutSchema.optional(),
    role: z.enum(userRoles).optional(),
}).refine(
    (data) => Object.values(data).some(v => v !== undefined),
    'Se debe proporcionar al menos un parámetro de consulta: id, corporateEmail, rut, role o name'
);

/* Body para actualizar usuario */
export const userBodySchema = z.object({
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no debe exceder los 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .optional(),
    corporateEmail: z.email('El correo corporativo debe ser un correo electrónico válido')
        .refine(isAllowedCorporateEmailDomain, 'El dominio del correo corporativo no es válido')
        .optional(),
    rut: rutSchema.optional(),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(16, 'La contraseña no debe exceder los 16 caracteres')
        .regex(/^[A-Za-z0-9!@#$%^&*_\-\.]+$/, 'La contraseña solo puede contener letras, números y los siguientes caracteres especiales: !@#$%^&*_-.')
        .optional(),
    role: z.enum(userRoles).optional(),
}).superRefine((data, ctx) => {
    const hasAtLeastOne = Object.values(data).some(v => v !== undefined);
    if (!hasAtLeastOne) {
        ctx.addIssue({
            code: 'custom',
            message: 'Se debe proporcionar al menos un campo para actualizar: name, corporateEmail, rut, password o role',
        });
    }
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserBodyInput = z.infer<typeof userBodySchema>;