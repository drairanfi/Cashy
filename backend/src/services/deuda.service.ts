import type { Cuota, Deuda } from '@prisma/client';
import { deudaRepository } from '../repositories/deuda.repository.js';
import { HttpError } from '../utils/httpError.js';
import { dividirMonto, generarFechas, type Frecuencia } from '../utils/deuda.js';
import type { CreateDeudaInput } from '../schemas/deuda.schema.js';

type DeudaConCuotas = Deuda & { cuotas: Cuota[] };

function cuotaDTO(cuota: Cuota) {
  return {
    id: cuota.id,
    numero: cuota.numero,
    fechaVencimiento: cuota.fechaVencimiento.toISOString(),
    monto: cuota.monto.toNumber(),
    estado: cuota.estado,
  };
}

function resumen(deuda: DeudaConCuotas) {
  let pagadoCents = 0;
  let pendienteCents = 0;
  let cuotasPagadas = 0;
  let proximaFecha: string | null = null;

  for (const cuota of deuda.cuotas) {
    const cents = Math.round(cuota.monto.toNumber() * 100);
    if (cuota.estado === 'pagada') {
      pagadoCents += cents;
      cuotasPagadas += 1;
    } else {
      pendienteCents += cents;
      if (!proximaFecha) {
        proximaFecha = cuota.fechaVencimiento.toISOString();
      }
    }
  }

  return {
    id: deuda.id,
    nombre: deuda.nombre,
    direccion: deuda.direccion,
    montoTotal: deuda.montoTotal.toNumber(),
    cantidadCuotas: deuda.cantidadCuotas,
    frecuencia: deuda.frecuencia,
    primeraFecha: deuda.primeraFecha.toISOString(),
    montoPagado: pagadoCents / 100,
    montoPendiente: pendienteCents / 100,
    cuotasPagadas,
    totalCuotas: deuda.cuotas.length,
    proximaFecha,
  };
}

function detalle(deuda: DeudaConCuotas) {
  return {
    ...resumen(deuda),
    cuotas: deuda.cuotas.map(cuotaDTO),
  };
}

export async function listDeudasUseCase(usuarioId: string) {
  const deudas = await deudaRepository.findByUsuario(usuarioId);
  return deudas.map(resumen);
}

export async function createDeudaUseCase(usuarioId: string, data: CreateDeudaInput) {
  const primeraFecha = new Date(`${data.primeraFecha}T00:00:00.000Z`);
  if (Number.isNaN(primeraFecha.getTime())) {
    throw new HttpError(400, 'Fecha inválida');
  }

  const fechas = generarFechas(
    primeraFecha,
    data.frecuencia as Frecuencia,
    data.cantidadCuotas,
  );
  const montos = dividirMonto(data.montoTotal, data.cantidadCuotas);

  const deuda = await deudaRepository.createWithCuotas(
    usuarioId,
    {
      nombre: data.nombre,
      direccion: data.direccion,
      montoTotal: data.montoTotal,
      cantidadCuotas: data.cantidadCuotas,
      frecuencia: data.frecuencia,
      primeraFecha,
    },
    fechas.map((fecha, index) => ({
      numero: index + 1,
      fechaVencimiento: fecha,
      monto: montos[index],
    })),
  );

  return detalle(deuda);
}

export async function getDeudaUseCase(usuarioId: string, id: string) {
  const deuda = await deudaRepository.findById(id);
  if (!deuda || deuda.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Deuda no encontrada');
  }

  return detalle(deuda);
}

export async function pagarCuotaUseCase(usuarioId: string, id: string, numero: string) {
  const deuda = await deudaRepository.findById(id);
  if (!deuda || deuda.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Deuda no encontrada');
  }

  const numeroCuota = Number(numero);
  const cuota = deuda.cuotas.find((c) => c.numero === numeroCuota);
  if (!cuota) {
    throw new HttpError(404, 'Cuota no encontrada');
  }

  await deudaRepository.pagarCuota(cuota.id);

  const actualizada = await deudaRepository.findById(id);
  if (!actualizada) {
    throw new HttpError(404, 'Deuda no encontrada');
  }

  const cuotaActualizada = actualizada.cuotas.find((c) => c.numero === numeroCuota);
  if (!cuotaActualizada) {
    throw new HttpError(404, 'Cuota no encontrada');
  }

  return {
    cuota: cuotaDTO(cuotaActualizada),
    resumen: resumen(actualizada),
  };
}

export async function deleteDeudaUseCase(usuarioId: string, id: string) {
  const deuda = await deudaRepository.findById(id);
  if (!deuda || deuda.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Deuda no encontrada');
  }

  return deudaRepository.remove(id);
}

export async function calendarioUseCase(usuarioId: string) {
  const cuotas = await deudaRepository.findCuotasPendientes(usuarioId);
  return cuotas.map((cuota) => ({
    fechaVencimiento: cuota.fechaVencimiento.toISOString(),
    deudaNombre: cuota.deuda.nombre,
    numero: cuota.numero,
    monto: cuota.monto.toNumber(),
  }));
}
