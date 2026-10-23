import { prisma } from '../config/prisma.js';

export const moduloPersonalizadoRepository = {
  create: (usuarioId: string, nombre: string) =>
    prisma.moduloPersonalizado.create({ data: { usuarioId, nombre } }),

  findByUsuario: (usuarioId: string) =>
    prisma.moduloPersonalizado.findMany({ where: { usuarioId }, orderBy: { createdAt: 'asc' } }),

  findById: (id: string) => prisma.moduloPersonalizado.findUnique({ where: { id } }),

  update: (id: string, data: { activo?: boolean }) =>
    prisma.moduloPersonalizado.update({ where: { id }, data }),

  remove: (id: string) => prisma.moduloPersonalizado.delete({ where: { id } }),
};
