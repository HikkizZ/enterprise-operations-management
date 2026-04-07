export const eventType = {
    CONTRATACION: 'Contratacion',
    ACTUALIZACION_LABORAL: 'Actualizacion Laboral',
    ACTUALIZACION_PERSONAL: 'Actualizacion Personal',
    CARGA_CONTRATO: 'Carga Contrato',
    ELIMINACION_CONTRATO: 'Eliminacion Contrato',
    DESVINCULACION: 'Desvinculacion',
    REACTIVACION: 'Reactivacion',
    LICENCIA: 'Licencia',
    PERMISO: 'Permiso',
} as const;

export type EventType = (typeof eventType)[keyof typeof eventType];