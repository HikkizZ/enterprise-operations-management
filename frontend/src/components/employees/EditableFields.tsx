import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EditableTextField({
    label,
    value,
    displayValue,
    isEditing,
    onChange,
    type = 'text',
    icon: Icon,
    mono,
}: {
    label: string;
    value: string;
    displayValue?: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    type?: string;
    icon?: React.ElementType;
    mono?: boolean;
}) {
    const shown = displayValue ?? value;
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            {isEditing ? (
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9"
                />
            ) : (
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                    <p className={`text-sm ${mono ? 'font-mono' : ''} ${shown ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {shown || '—'}
                    </p>
                </div>
            )}
        </div>
    );
}

export function EditableSelectField({
    label,
    value,
    isEditing,
    onChange,
    options,
    icon: Icon,
}: {
    label: string;
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    options: string[];
    icon?: React.ElementType;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            {isEditing ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                    <p className={`text-sm ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {value || '—'}
                    </p>
                </div>
            )}
        </div>
    );
}

export function ReadOnlyField({
    label,
    value,
    icon: Icon,
    mono,
}: {
    label: string;
    value: string | null | undefined;
    icon?: React.ElementType;
    mono?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                <p className={`text-sm ${mono ? 'font-mono' : ''} ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}