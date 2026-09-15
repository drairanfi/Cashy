import { z } from 'zod';

export const createMetaSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  montoObjetivo: z.number().positive('Monto mayor a 0'),
  montoMensual: z.number().positive('Monto mayor a 0'),
});

export type CreateMetaInput = z.infer<typeof createMetaSchema>;
