import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export const servicioRepository = {
  create: (usuarioId: string, data: { nombre: string; montoDestinado: number }) =>
    prisma.servicio.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.servicio.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) => prisma.servicio.findUnique({ where: { id } }),

  update: (id: string, data: { nombre?: string; montoDestinado?: number }) =>
    prisma.servicio.update({ where: { id }, data }),

  remove: (id: string) => prisma.servicio.delete({ where: { id } }),

  sumMontoDestinado: async (usuarioId: string) => {
    const agg = await prisma.servicio.aggregate({
      where: { usuarioId },
      _sum: { montoDestinado: true },
    });
    return agg._sum.montoDestinado ?? new Prisma.Decimal(0);
  },
};
