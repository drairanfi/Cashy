import { prisma } from '../config/prisma.js';

export const sueldoRepository = {
  findByUsuario: (usuarioId: string) =>
    prisma.sueldo.findUnique({ where: { usuarioId } }),

  upsert: (usuarioId: string, monto: number) =>
    prisma.sueldo.upsert({
      where: { usuarioId },
      create: { usuarioId, monto },
      update: { monto },
    }),
};
