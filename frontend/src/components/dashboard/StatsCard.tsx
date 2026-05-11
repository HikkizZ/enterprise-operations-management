import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import type { StatItem } from '@/types/dashboard.types';

interface StatsCardProps {
    title: string;
    value: string | number | StatItem;
    icon: LucideIcon;
}

function DeltaBadge({ delta }: { delta: number }) {
    if (delta > 0) return (
        <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" />+{delta}
        </span>
    );

    if (delta < 0) return (
        <span className="flex items-center gap-0.5 text-xs text-destructive">
            <TrendingDown className="size-3" />{delta}
        </span>
    );

    return (
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Minus className="size-3" />0
        </span>
    );
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
    const isStatItem = typeof value === 'object' && value !== null;
    const displayValue = isStatItem ? value.value : value;
    const delta = isStatItem ? value.delta : null;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{displayValue}</p>
                        {delta !== null && <DeltaBadge delta={delta} />}
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="size-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}