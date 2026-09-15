import { prisma } from '../config/prisma.js';

export const userRepository = {
  findByEmail: (email: string) => prisma.usuario.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.usuario.findUnique({
      where: { id },
      include: { sueldo: true },
    }),

  create: (data: { email: string; password: string; nombre: string }) =>
    prisma.usuario.create({ data }),
};
