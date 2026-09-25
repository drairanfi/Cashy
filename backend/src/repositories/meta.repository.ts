import { prisma } from '../config/prisma.js';

export const metaRepository = {
  create: (
    usuarioId: string,
    data: { nombre: string; montoObjetivo: number; montoMensual: number; prioritaria?: boolean },
  ) => prisma.meta.create({ data: { usuarioId, prioritaria: false, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.meta.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) => prisma.meta.findUnique({ where: { id } }),

  update: (
    id: string,
    data: {
      nombre?: string;
      montoObjetivo?: number;
      montoMensual?: number;
      prioritaria?: boolean;
    },
  ) => prisma.meta.update({ where: { id }, data }),

  remove: (id: string) => prisma.meta.delete({ where: { id } }),
};
