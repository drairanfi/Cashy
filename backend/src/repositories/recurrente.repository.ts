import { prisma } from '../config/prisma.js';

interface CreateReglaData {
  concepto: string;
  monto: number;
  categoria: string | null;
  frecuencia: string;
  intervalo: number;
  fechaInicio: Date;
  fechaFin: Date | null;
}

const conOcurrencias = { ocurrencias: { orderBy: { fecha: 'asc' } } } as const;
const conPendientes = {
  ocurrencias: { where: { estado: 'pendiente' }, orderBy: { fecha: 'asc' } },
} as const;

export const recurrenteRepository = {
  createWithOcurrencias: (usuarioId: string, data: CreateReglaData, fechas: Date[]) =>
    prisma.reglaRecurrente.create({
      data: {
        usuarioId,
        ...data,
        ocurrencias: { create: fechas.map((fecha) => ({ fecha })) },
      },
      include: conOcurrencias,
    }),

  findByUsuario: (usuarioId: string) =>
    prisma.reglaRecurrente.findMany({
      where: { usuarioId },
      include: conPendientes,
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) =>
    prisma.reglaRecurrente.findUnique({ where: { id }, include: conOcurrencias }),

  findActivasByUsuario: (usuarioId: string) =>
    prisma.reglaRecurrente.findMany({ where: { usuarioId, estado: 'activa' } }),

  updateEstado: (id: string, estado: string) =>
    prisma.reglaRecurrente.update({ where: { id }, data: { estado } }),

  remove: (id: string) => prisma.reglaRecurrente.delete({ where: { id } }),

  createOcurrencias: (reglaId: string, fechas: Date[]) =>
    prisma.ocurrencia.createMany({
      data: fechas.map((fecha) => ({ reglaId, fecha })),
      skipDuplicates: true,
    }),

  findOcurrenciasPendientes: (usuarioId: string) =>
    prisma.ocurrencia.findMany({
      where: { estado: 'pendiente', regla: { usuarioId } },
      include: { regla: { select: { concepto: true, monto: true, categoria: true } } },
      orderBy: { fecha: 'asc' },
    }),

  findOcurrenciaById: (id: string) =>
    prisma.ocurrencia.findUnique({ where: { id }, include: { regla: true } }),

  updateOcurrenciaEstado: (id: string, estado: string) =>
    prisma.ocurrencia.update({ where: { id }, data: { estado } }),
};
