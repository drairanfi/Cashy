import { prisma } from '../config/prisma.js';

export const comidaRepository = {
  create: (
    usuarioId: string,
    data: { descripcion: string; monto: number; cuentaId?: string | null },
  ) => prisma.comida.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.comida.findMany({ where: { usuarioId }, orderBy: { fecha: 'desc' } }),

  findById: (id: string) => prisma.comida.findUnique({ where: { id } }),

  remove: (id: string) => prisma.comida.delete({ where: { id } }),
};
