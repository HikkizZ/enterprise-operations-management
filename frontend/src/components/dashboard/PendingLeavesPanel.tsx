import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PendingLeaveItem } from '@/types/dashboard.types';

interface PendingLeavesPanelProps {
    items: PendingLeaveItem[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

export default function PendingLeavesPanel({ items }: PendingLeavesPanelProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Licencias pendientes</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin solicitudes pendientes.</p>
                ) : (
                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{item.employeeName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(item.startDate)} – {formatDate(item.endDate)} · {item.days}d
                                    </p>
                                </div>
                                <Badge variant="outline" className="shrink-0 text-xs">{item.type}</Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}