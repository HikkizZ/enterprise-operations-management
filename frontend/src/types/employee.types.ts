export const estadoLaboral = {
    ACTIVO: 'Activo',
    LICENCIA: 'Licencia Médica',
    PERMISO: 'Permiso Administrativo',
    DESVINCULADO: 'Desvinculado',
} as const;

export type EstadoLaboral = (typeof estadoLaboral)[keyof typeof estadoLaboral];

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

export interface EmployeeProfileResponse {
    id: string;
    status: EstadoLaboral;
    jobTitle: string | null;
    area: string | null;
    contractType: TipoContrato | null;
    employmentType: TipoJornada | null;
    baseSalary: number | null;
    fondoAFP: string | null;
    previsionSalud: string | null;
    seguroCesantia: string | null;
    startDateContract: string | null;
    endDateContract: string | null;
}

export interface EmployeeResponse {
    id: string;
    rut: string;
    names: string;
    paternalSurname: string;
    maternalSurname: string | null;
    birthDate: string | null;
    phoneNumber: string | null;
    email: string;
    emergencyContact: string | null;
    address: string | null;
    hireDate: string;
    onSystem: boolean;
    profile: EmployeeProfileResponse | null;
    createdAt: string;
}

export interface CreateEmployeeBody {
    rut: string;
    names: string;
    paternalSurname: string;
    email: string;
    hireDate: string;
}

export interface CreateEmployeeResult {
    employee: EmployeeResponse;
    corporateEmail: string;
    tempPassword: string;
    emailSent: boolean;
}

export const tipoSolicitud = {
    LICENCIA: 'Licencia médica',
    PERMISO: 'Permiso administrativo',
} as const;
export type TipoSolicitud = (typeof tipoSolicitud)[keyof typeof tipoSolicitud];

export const estadoSolicitud = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
    VENCIDA: 'Vencida',
    CANCELADA: 'Cancelada',
} as const;
export type EstadoSolicitud = (typeof estadoSolicitud)[keyof typeof estadoSolicitud];

export interface LeaveResponse {
    id: string;
    type: TipoSolicitud;
    startDate: string;
    endDate: string;
    reason: string;
    status: EstadoSolicitud;
    comments: string | null;
    reviewedBy: { id: string; username: string } | null;
    attachedFileURL: string | null;
    applicationDate: string;
}

export interface EmploymentHistoryResponse {
    id: string;
    jobTitle: string;
    area: string;
    contractType: string;
    employmentType: string;
    baseSalary: number;
    startDate: string;
    endDate: string | null;
    terminationReason: string | null;
    reactivationReason: string | null;
    notes: string | null;
    contractURL: string | null;
    afp: string;
    healthInsurance: string;
    unemploymentInsurance: string;
    status: string;
    eventType: string;
    leaveStartDate: string | null;
    leaveEndDate: string | null;
    leaveReason: string | null;
    registeredBy: { id: string; username: string } | null;
    createdAt: string;
}