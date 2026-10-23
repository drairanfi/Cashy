import { prisma } from '../config/prisma.js';

export const categoriaRepository = {
  create: (usuarioId: string, nombre: string) =>
    prisma.categoria.create({ data: { usuarioId, nombre } }),

  findByUsuario: (usuarioId: string) =>
    prisma.categoria.findMany({ where: { usuarioId }, orderBy: { createdAt: 'asc' } }),

  findById: (id: string) => prisma.categoria.findUnique({ where: { id } }),

  renameWithReferences: (usuarioId: string, id: string, from: string, to: string) =>
    prisma.$transaction([
      prisma.categoria.update({ where: { id }, data: { nombre: to } }),
      prisma.gasto.updateMany({ where: { usuarioId, categoria: from }, data: { categoria: to } }),
      prisma.reglaRecurrente.updateMany({
        where: { usuarioId, categoria: from },
        data: { categoria: to },
      }),
    ]),

  remove: (id: string) => prisma.categoria.delete({ where: { id } }),
};
