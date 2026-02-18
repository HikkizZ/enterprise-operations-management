import type { ValueTransformer } from 'typeorm';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const makeDateTransformer = (label = 'Fecha inválida'): ValueTransformer => ({
    to: (value: Date | string | null): string | null => {
        if (!value) return null;
        if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) return value;

        const date = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(date.getTime())) {
            console.error(`${label} en transformer:`, value);
            return null;
        }
        return date.toISOString().split('T')[0] || null;
    },
    from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        if (typeof value === 'string') {
            const parts = value.split('-').map(Number);
            if (parts.length !== 3) return null;
            const [year, month, day] = parts as [number, number, number];
            return new Date(year, month - 1, day);
        }
        return value;
    },
});