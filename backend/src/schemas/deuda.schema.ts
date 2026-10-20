import { z } from 'zod';

export const DIRECCIONES = ['debida', 'a_cobrar'] as const;
export const FRECUENCIAS = ['semanal', 'quincenal', 'mensual'] as const;

export const createDeudaSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Mínimo 1 carácter')
      .max(80, 'Máximo 80 caracteres'),
    direccion: z.enum(DIRECCIONES, {
      errorMap: () => ({ message: 'Dirección inválida' }),
    }),
    montoTotal: z
      .number({ invalid_type_error: 'Monto inválido' })
      .positive('El monto debe ser mayor a 0'),
    cantidadCuotas: z
      .number({ invalid_type_error: 'Cantidad inválida' })
      .int('Debe ser un número entero')
      .min(1, 'Mínimo 1 cuota')
      .max(120, 'Máximo 120 cuotas'),
    frecuencia: z.enum(FRECUENCIAS, {
      errorMap: () => ({ message: 'Frecuencia inválida' }),
    }),
    primeraFecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  })
  .refine((data) => data.montoTotal >= data.cantidadCuotas, {
    message: 'El monto total es demasiado bajo para la cantidad de cuotas',
    path: ['montoTotal'],
  });

export type CreateDeudaInput = z.infer<typeof createDeudaSchema>;
