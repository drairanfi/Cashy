import { prisma } from '../config/prisma.js';

interface CreateDeudaData {
  nombre: string;
  direccion: string;
  montoTotal: number;
  cantidadCuotas: number;
  frecuencia: string;
  primeraFecha: Date;
}

interface CreateCuotaData {
  numero: number;
  fechaVencimiento: Date;
  monto: number;
}

const conCuotas = { cuotas: { orderBy: { numero: 'asc' } } } as const;

export const deudaRepository = {
  createWithCuotas: (usuarioId: string, data: CreateDeudaData, cuotas: CreateCuotaData[]) =>
    prisma.deuda.create({
      data: {
        usuarioId,
        ...data,
        cuotas: { create: cuotas },
      },
      include: conCuotas,
    }),

  findByUsuario: (usuarioId: string) =>
    prisma.deuda.findMany({
      where: { usuarioId },
      include: conCuotas,
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) =>
    prisma.deuda.findUnique({ where: { id }, include: conCuotas }),

  pagarCuota: (id: string) =>
    prisma.cuota.update({ where: { id }, data: { estado: 'pagada' } }),

  remove: (id: string) => prisma.deuda.delete({ where: { id } }),

  findCuotasPendientes: (usuarioId: string) =>
    prisma.cuota.findMany({
      where: { estado: 'pendiente', deuda: { usuarioId } },
      include: { deuda: { select: { nombre: true } } },
      orderBy: { fechaVencimiento: 'asc' },
    }),
};
