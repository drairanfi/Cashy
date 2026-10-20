import { z } from 'zod';

import { cuentaValidationMessages as messages } from './validation-messages';

export const CUENTA_TIPOS = [
  'efectivo',
  'banco',
  'ahorros',
  'billetera',
  'tarjeta',
  'otro'
] as const;

export const cuentaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: messages.nameRequired })
    .max(60, { error: messages.nameTooLong }),
  tipo: z.enum(CUENTA_TIPOS, { error: messages.typeRequired }),
  saldoInicial: z.number({ error: messages.initialBalanceInvalid })
});

export type CuentaInput = z.infer<typeof cuentaSchema>;
