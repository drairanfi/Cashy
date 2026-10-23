import { z } from 'zod';

export const createRegistroModuloPersonalizadoSchema = z.object({
  descripcion: z.string().trim().min(2).max(100),
  monto: z.number().positive(),
  cuentaId: z.string().trim().min(1).nullable().optional(),
});

export type CreateRegistroModuloPersonalizadoInput = z.infer<
  typeof createRegistroModuloPersonalizadoSchema
>;
