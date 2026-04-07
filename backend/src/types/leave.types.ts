export const TipoSolicitud = {
    LICENCIA: "Licencia médica",
    PERMISO: "Permiso administrativo"
} as const;

export type TipoSolicitud = (typeof TipoSolicitud)[keyof typeof TipoSolicitud];

export const EstadoSolicitud = {
    PENDIENTE: "Pendiente",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
    VENCIDA: "Vencida",
    CANCELADA: "Cancelada",
} as const

export type EstadoSolicitud = (typeof EstadoSolicitud)[keyof typeof EstadoSolicitud];

export interface CreateLeaveInput {
    type: TipoSolicitud;
    startDate: Date;
    endDate: Date;
    reason: string;
};

export interface ReviewLeaveInput {
    status: 'Aprobada' | 'Rechazada';
    comments?: string;
}