import { prisma } from '../config/prisma.js';

export const ahorroRepository = {
  create: (usuarioId: string, data: { nombre: string; objetivo: number; actual: number }) =>
    prisma.ahorro.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.ahorro.findMany({ where: { usuarioId }, orderBy: { createdAt: 'desc' } }),

  findById: (id: string) => prisma.ahorro.findUnique({ where: { id } }),

  remove: (id: string) => prisma.ahorro.delete({ where: { id } }),

  addAporte: (id: string, monto: number) =>
    prisma.ahorro.update({ where: { id }, data: { actual: { increment: monto } } }),
};
