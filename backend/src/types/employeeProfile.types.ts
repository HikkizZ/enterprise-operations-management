export const estadoLaboral = {
    ACTIVO: 'Activo',
    LICENCIA: 'Licencia Médica',
    PERMISO: 'Permiso Administrativo',
    DESVINCULADO: 'Desvinculado',
} as const;

export type EstadoLaboral = (typeof estadoLaboral)[keyof typeof estadoLaboral];

export const fondoAFP = {
    CAPITAL: 'Capital',
    HABITAT: 'Habitat',
    PROVIDA: 'Provida',
    MODELO: 'Modelo',
    CUPRUM: 'Cuprum',
    PLANVITAL: 'PlanVital',
    UNO: 'Uno',
} as const;    

export type FondoAFP = (typeof fondoAFP)[keyof typeof fondoAFP];

export const previsionSalud = {
    FONASA: 'Fonasa',
    ISAPRE: 'Isapre',
} as const;

export type TipoPrevisionSalud = (typeof previsionSalud)[keyof typeof previsionSalud];

export const seguroCesantia = {
    SI: 'Sí',
    NO: 'No',
} as const;

export type SeguroCesantia = (typeof seguroCesantia)[keyof typeof seguroCesantia];

export const tipoContrato = {
    INDEFINIDO: 'Indefinido',
    PLAZO_FIJO: 'Plazo Fijo',
    PART_TIME: 'Part Time',
    OBRA_O_SERVICIO: 'Obra o Servicio',
} as const;

export type TipoContrato = (typeof tipoContrato)[keyof typeof tipoContrato];

export const tipoJornada = {
    COMPLETA: 'Completa',
    PARCIAL: 'Parcial',
    REMOTA: 'Remota',
    HIBRIDA: 'Híbrida',
} as const;

export type TipoJornada = (typeof tipoJornada)[keyof typeof tipoJornada];