import { z } from 'zod';

export const createServicioSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  montoDestinado: z.number().positive('Monto mayor a 0'),
});

export type CreateServicioInput = z.infer<typeof createServicioSchema>;
