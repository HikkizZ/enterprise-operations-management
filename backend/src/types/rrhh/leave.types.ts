export const tipoSolicitud = {
    LICENCIA: "Licencia médica",
    PERMISO: "Permiso administrativo"
} as const;

export type TipoSolicitud = (typeof tipoSolicitud)[keyof typeof tipoSolicitud];

export const estadoSolicitud = {
    PENDIENTE: "Pendiente",
    APROBADA: "Aprobada",
    RECHAZADA: "Rechazada",
    VENCIDA: "Vencida",
    CANCELADA: "Cancelada",
} as const

export type EstadoSolicitud = (typeof estadoSolicitud)[keyof typeof estadoSolicitud];

export interface CreateLeaveInput {
    type: TipoSolicitud;
    startDate: Date;
    endDate: Date;
    reason: string;
};

export interface ReviewLeaveInput {
    status: 'Aprobada' | 'Rechazada';
    comments?: string | undefined;
}