import { prisma } from '../config/prisma.js';

export const gimnasioRepository = {
  create: (usuarioId: string, data: { actividad: string; monto: number }) =>
    prisma.gimnasio.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.gimnasio.findMany({ where: { usuarioId }, orderBy: { fecha: 'desc' } }),

  findById: (id: string) => prisma.gimnasio.findUnique({ where: { id } }),

  remove: (id: string) => prisma.gimnasio.delete({ where: { id } }),
};
