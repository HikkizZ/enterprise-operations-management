import { z } from 'zod';
import { configEnv } from '../config/configEnv.js';

const allowedEmailDomains = configEnv.domains.allowedEmailDomains;
const allowedCorporateEmailDomains = configEnv.domains.allowedCorporateEmailDomains;

const isAllowedEmailDomain = (value: string): boolean => {
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    return allowedEmailDomains.includes(domain) || allowedCorporateEmailDomains.includes(domain);
};


export const loginSchema = z.object({
    corporateEmail: z.email('El correo corporativo debe ser un correo electrónico válido')
        .min(1, 'El correo corporativo es obligatorio')
        .refine(isAllowedEmailDomain, { message: 'El dominio del correo electrónico no es válido' }),

    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;