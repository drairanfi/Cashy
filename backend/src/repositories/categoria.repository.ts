import { prisma } from '../config/prisma.js';

export const categoriaRepository = {
  create: (usuarioId: string, nombre: string) =>
    prisma.categoria.create({ data: { usuarioId, nombre } }),

  findByUsuario: (usuarioId: string) =>
    prisma.categoria.findMany({ where: { usuarioId }, orderBy: { createdAt: 'asc' } }),

  findById: (id: string) => prisma.categoria.findUnique({ where: { id } }),

  remove: (id: string) => prisma.categoria.delete({ where: { id } }),
};
