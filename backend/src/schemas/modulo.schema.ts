import { z } from 'zod';

export const MODULO_CLAVES = [
  'gastos',
  'comida',
  'gimnasio',
  'ahorros',
  'recurrentes',
  'deudas',
  'metas',
] as const;

export type ModuloClave = (typeof MODULO_CLAVES)[number];

export function isModuloClave(value: string): value is ModuloClave {
  return (MODULO_CLAVES as readonly string[]).includes(value);
}

export const updateModuloSchema = z.object({
  activo: z.boolean(),
});

export type UpdateModuloInput = z.infer<typeof updateModuloSchema>;
