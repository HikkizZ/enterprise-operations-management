import { Badge } from '@/components/ui/badge';
import { estadoLaboral } from '@/types/employee.types';

export function getStatusBadge(status: string) {
    switch (status) {
        case estadoLaboral.ACTIVO:
            return <Badge className="bg-status-active/15 text-status-active border-0">Activo</Badge>;
        case estadoLaboral.LICENCIA:
            return <Badge className="bg-status-warning/15 text-status-warning border-0">En Licencia</Badge>;
        case estadoLaboral.PERMISO:
            return <Badge className="bg-status-warning/15 text-status-warning border-0">En Permiso</Badge>;
        case estadoLaboral.DESVINCULADO:
            return <Badge className="bg-destructive/15 text-destructive border-0">Desvinculado</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function getInitials(names: string, paternalSurname: string) {
    return `${names[0] ?? ''}${paternalSurname[0] ?? ''}`.toUpperCase();
}