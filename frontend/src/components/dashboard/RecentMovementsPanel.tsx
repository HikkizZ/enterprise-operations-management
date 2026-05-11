import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventType, type RecentMovementItem } from '@/types/dashboard.types';

interface RecentMovementsPanelProps {
    items: RecentMovementItem[];
}

const eventVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [eventType.CONTRATACION]: 'default',
    [eventType.REACTIVACION]: 'secondary',
    [eventType.DESVINCULACION]: 'destructive',
    [eventType.ACTUALIZACION_LABORAL]: 'outline',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RecentMovementsPanel({ items }: RecentMovementsPanelProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Movimientos recientes</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin movimientos recientes.</p>
                ) : (
                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{item.employeeName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                                </div>
                                <Badge variant={eventVariant[item.eventType] ?? 'outline'} className="shrink-0 text-xs">
                                    {item.eventType}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}