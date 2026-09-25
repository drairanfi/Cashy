import { prisma } from '../config/prisma.js';

export const gastoRepository = {
  create: (usuarioId: string, data: { descripcion: string; monto: number; categoria: string }) =>
    prisma.gasto.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.gasto.findMany({ where: { usuarioId }, orderBy: { fecha: 'desc' } }),

  findById: (id: string) => prisma.gasto.findUnique({ where: { id } }),

  remove: (id: string) => prisma.gasto.delete({ where: { id } }),
};
