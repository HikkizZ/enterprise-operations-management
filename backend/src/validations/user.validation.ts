import Joi from 'joi';
import type { CustomHelpers, ObjectSchema } from 'joi';
import { isValidRut } from 'rut-kit';
import { userRoles } from '../types/user.types.js';
import { configEnv } from '../config/configEnv.js';

const allowedCorporateEmailDomains = configEnv.domains.allowedCorporateEmailDomains;

/* Validador personalizado para dominios de correo corporativo */
const corporateEmailDomainValidator = (value: string, helpers: CustomHelpers) => {
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain) return helpers.message({ custom: 'El correo corporativo no es válido' });

    const allowed = allowedCorporateEmailDomains.includes(domain);
    if (!allowed) return helpers.message({ custom: 'El dominio del correo corporativo no es válido' });

    return value;
}

/* Validador personalizado para RUT */
const rutValidator = (value: string, helpers: CustomHelpers) => {
    if (!isValidRut(value)) return helpers.message({ custom: 'El RUT ingresado no es válido' });
    return value;
}

/* Validación de Query para buscar usuario */
export const userQueryValidationSchema: ObjectSchema = Joi.object({
    id: Joi.string()
        .uuid({ version: 'uuidv4' })
        .messages({
            'string.uuid': 'El ID debe ser un UUID válido',
            'string.base': 'El ID debe ser una cadena de texto',
        }),
    corporateEmail: Joi.string()
        .email()
        .messages({
            'string.email': 'El correo corporativo debe ser un correo electrónico válido',
            'string.base': 'El correo corporativo debe ser una cadena de texto',
        }),
    name: Joi.string()
        .min(3)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            'string.base': 'El nombre debe ser una cadena de texto',
            'string.min': 'El nombre debe tener al menos {#limit} caracteres',
            'string.max': 'El nombre no debe exceder los {#limit} caracteres',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        }),
    rut: Joi.string()
        .custom(rutValidator)
        .messages({
            'string.base': 'El RUT debe ser una cadena de texto',
        }),
    role: Joi.string()
        .valid(...userRoles)
        .messages({
            'any.only': 'El rol especificado no es válido',
            'string.base': 'El rol debe ser una cadena de texto',
        }),
})
    .or('id', 'corporateEmail', 'rut', 'role', 'name')
    .unknown(false)
    .messages({
        'object.missing': 'Se debe proporcionar al menos un parámetro de consulta: id, corporateEmail, rut, role o name',
        'object.unknown': 'Se han proporcionado parámetros de consulta no permitidos',
    });

/* Validación del cuerpo para actualizar usuario */
export const UserBodyValidationSquema: ObjectSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.base": "El nombre debe ser una cadena de texto",
            "string.min": "El nombre debe tener al menos {#limit} caracteres",
            "string.max": "El nombre no debe exceder los {#limit} caracteres",
            "string.pattern.base": "El nombre solo puede contener letras y espacios",
            "string.empty": "El nombre no puede estar vacío",
        }),
    corporateEmail: Joi.string()
        .email()
        .custom(corporateEmailDomainValidator)
        .messages({
            "string.base": "El correo corporativo debe ser una cadena de texto",
            "string.email": "El correo corporativo debe ser un correo electrónico válido",
        }),
    rut: Joi.string()
        .custom(rutValidator)
        .messages({
            'string.base': 'El RUT debe ser una cadena de texto',
            'string.empty': 'El RUT no puede estar vacío',
        })
        .when('role', {
            is: 'SuperAdministrador',
            then: Joi.optional(),
            otherwise: Joi.required()
                .messages({
                    'any.required': 'El RUT es obligatorio',
                })
        }),
    password: Joi.string()
        .min(8)
        .max(16)
        .pattern(/^[A-Za-z0-9!@#$%^&*_\-\.]+$/)
        .messages({
            "string.base": "La contraseña debe ser una cadena de texto",
            "string.min": "La contraseña debe tener al menos {#limit} caracteres",
            "string.max": "La contraseña no debe exceder los {#limit} caracteres",
            "string.pattern.base": "La contraseña solo puede contener letras, números y los siguientes caracteres especiales: !@#$%^&*_-.",
            "string.empty": "La contraseña no puede estar vacía",
        }),
    role: Joi.string()
        .valid(...userRoles)
        .messages({
            "any.only": "El rol especificado no es válido",
            "string.base": "El rol debe ser una cadena de texto",
        }),
})
    .or('name', 'corporateEmail', 'rut', 'password', 'role')
    .unknown(false)
    .messages({
        'object.missing': 'Se debe proporcionar al menos un campo para actualizar: name, corporateEmail, rut, password o role',
        'object.unknown': 'Se han proporcionado campos no permitidos en el cuerpo de la solicitud',
    });