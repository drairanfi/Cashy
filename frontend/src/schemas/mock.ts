import { z } from 'zod';
import { GASTO_CATEGORIAS } from '../types';

export const gastoFormSchema = z.object({
  descripcion: z.string().min(2, 'La descripción es requerida'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  categoria: z.enum(GASTO_CATEGORIAS),
});
export type GastoFormInput = z.infer<typeof gastoFormSchema>;

export const simpleGastoFormSchema = z.object({
  descripcion: z.string().min(2, 'La descripción es requerida'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
});
export type SimpleGastoFormInput = z.infer<typeof simpleGastoFormSchema>;

export const ahorroFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  objetivo: z.coerce.number().positive('El objetivo debe ser mayor a 0'),
  actual: z.coerce.number().min(0).default(0),
});
export type AhorroFormInput = z.infer<typeof ahorroFormSchema>;

export const aporteSchema = z.object({
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
});
export type AporteInput = z.infer<typeof aporteSchema>;