import { prisma } from '../config/prisma.js';

export const metaRepository = {
  create: (usuarioId: string, data: { nombre: string; montoObjetivo: number; montoMensual: number }) =>
    prisma.meta.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.meta.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) => prisma.meta.findUnique({ where: { id } }),

  update: (id: string, data: { nombre?: string; montoObjetivo?: number; montoMensual?: number }) =>
    prisma.meta.update({ where: { id }, data }),

  remove: (id: string) => prisma.meta.delete({ where: { id } }),
};
