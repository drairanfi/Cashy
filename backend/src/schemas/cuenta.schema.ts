import { z } from 'zod';

export const TIPOS_CUENTA = ['efectivo', 'banco', 'ahorros', 'billetera', 'tarjeta', 'otro'] as const;

export const createCuentaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  tipo: z.enum(TIPOS_CUENTA, {
    errorMap: () => ({ message: 'Tipo de cuenta inválido' }),
  }),
  saldoInicial: z
    .number({ invalid_type_error: 'Saldo inválido' })
    .optional()
    .default(0),
});

export const updateCuentaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .optional(),
  tipo: z
    .enum(TIPOS_CUENTA, {
      errorMap: () => ({ message: 'Tipo de cuenta inválido' }),
    })
    .optional(),
  saldoInicial: z.number({ invalid_type_error: 'Saldo inválido' }).optional(),
});

export type CreateCuentaInput = z.infer<typeof createCuentaSchema>;
export type UpdateCuentaInput = z.infer<typeof updateCuentaSchema>;
