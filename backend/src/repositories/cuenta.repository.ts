import { prisma } from '../config/prisma.js';

interface CreateCuentaData {
  nombre: string;
  tipo: string;
  saldoInicial: number;
}

interface UpdateCuentaData {
  nombre?: string;
  tipo?: string;
  saldoInicial?: number;
}

const whereCuenta = { cuentaId: { not: null } } as const;

export const cuentaRepository = {
  create: (usuarioId: string, data: CreateCuentaData) =>
    prisma.cuenta.create({ data: { usuarioId, ...data } }),

  findByUsuario: (usuarioId: string) =>
    prisma.cuenta.findMany({ where: { usuarioId }, orderBy: { createdAt: 'asc' } }),

  findById: (id: string) => prisma.cuenta.findUnique({ where: { id } }),

  update: (id: string, data: UpdateCuentaData) =>
    prisma.cuenta.update({ where: { id }, data }),

  removeYDesvincular: (id: string) =>
    prisma.$transaction([
      prisma.gasto.updateMany({ where: { cuentaId: id }, data: { cuentaId: null } }),
      prisma.comida.updateMany({ where: { cuentaId: id }, data: { cuentaId: null } }),
      prisma.gimnasio.updateMany({ where: { cuentaId: id }, data: { cuentaId: null } }),
      prisma.cuenta.delete({ where: { id } }),
    ]),

  sumGastosPorCuenta: (usuarioId: string) =>
    prisma.gasto.groupBy({
      by: ['cuentaId'],
      where: { usuarioId, ...whereCuenta },
      _sum: { monto: true },
    }),

  sumComidasPorCuenta: (usuarioId: string) =>
    prisma.comida.groupBy({
      by: ['cuentaId'],
      where: { usuarioId, ...whereCuenta },
      _sum: { monto: true },
    }),

  sumGimnasioPorCuenta: (usuarioId: string) =>
    prisma.gimnasio.groupBy({
      by: ['cuentaId'],
      where: { usuarioId, ...whereCuenta },
      _sum: { monto: true },
    }),
};
