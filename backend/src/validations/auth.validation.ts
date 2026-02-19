import Joi from 'joi';
import type { CustomHelpers } from 'joi';
import { configEnv } from '../config/configEnv.js';

const allowedEmailDomains = configEnv.domains.allowedEmailDomains;
const allowedCorporateEmailDomains = configEnv.domains.allowedCorporateEmailDomains;

/* Validador personalizado para dominios de correo corporativo */
const EmailDomainValidator = (value: string, helpers: CustomHelpers) => {
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain) return helpers.message({ custom: 'El correo electrónico no es válido' });

    const allowed = allowedEmailDomains.includes(domain) || allowedCorporateEmailDomains.includes(domain);
    if (!allowed) return helpers.message({ custom: 'El dominio del correo electrónico no es válido' });

    return value;
}

/* Login Validation */
export const loginAuthValidationSchema = Joi.object({
    corporateEmail: Joi.string()
        .email()
        .required()
        .custom(EmailDomainValidator)
        .messages({
            'string.email': 'El correo corporativo debe ser un correo electrónico válido',
            'string.empty': 'El correo corporativo es obligatorio',
            'any.required': 'El correo corporativo es obligatorio',
            'any.base': 'El correo corporativo debe ser una cadena de texto',
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'string.empty': 'La contraseña es obligatoria',
            'any.required': 'La contraseña es obligatoria',
        })
})