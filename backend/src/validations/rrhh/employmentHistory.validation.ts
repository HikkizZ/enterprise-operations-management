import { z } from 'zod';

/* Params */
export const historyIdParamSchema = z.object({
    historyId: z.uuid('El ID del historial laboral debe ser un UUID válido'),
});

/* Inferred Types */
export type HistoryIdParam = z.infer<typeof historyIdParamSchema>;