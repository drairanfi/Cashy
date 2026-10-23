import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const registroModuloPersonalizadoRepository = {
  create: (
    usuarioId: string,
    moduloId: string,
    data: { descripcion: string; monto: number; cuentaId?: string | null },
  ) => prisma.registroModuloPersonalizado.create({ data: { usuarioId, moduloId, ...data } }),

  findByModulo: (moduloId: string) =>
    prisma.registroModuloPersonalizado.findMany({
      where: { moduloId },
      orderBy: { fecha: 'desc' },
    }),

  findById: (id: string) => prisma.registroModuloPersonalizado.findUnique({ where: { id } }),

  remove: (id: string) => prisma.registroModuloPersonalizado.delete({ where: { id } }),

  findActivosByUsuario: (usuarioId: string) =>
    prisma.registroModuloPersonalizado.findMany({
      where: { usuarioId, modulo: { activo: true } },
      select: { cuentaId: true, monto: true },
    }),

  sumPorCuentaActivos: async (usuarioId: string) => {
    const filas = await prisma.registroModuloPersonalizado.findMany({
      where: { usuarioId, cuentaId: { not: null }, modulo: { activo: true } },
      select: { cuentaId: true, monto: true },
    });
    const grupos = new Map<string, Prisma.Decimal>();
    for (const fila of filas) {
      if (!fila.cuentaId) continue;
      grupos.set(fila.cuentaId, (grupos.get(fila.cuentaId) ?? new Prisma.Decimal(0)).add(fila.monto));
    }
    return [...grupos].map(([cuentaId, total]) => ({ cuentaId, _sum: { monto: total } }));
  },
};
