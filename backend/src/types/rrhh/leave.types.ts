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

export const LEAVE_REVIEW_STATUS = {
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
} as const;

export type LeaveReviewStatus = typeof LEAVE_REVIEW_STATUS[keyof typeof LEAVE_REVIEW_STATUS];

export interface ReviewLeaveInput {
    status: LeaveReviewStatus;
    comments?: string | undefined;
}