import type { Servicio } from '@prisma/client';
import { servicioRepository } from '../repositories/servicio.repository.js';
import { sueldoRepository } from '../repositories/sueldo.repository.js';
import { HttpError } from '../utils/httpError.js';

function toDTO(servicio: Servicio) {
  return { ...servicio, montoDestinado: servicio.montoDestinado.toNumber() };
}

export async function listServiciosUseCase(usuarioId: string) {
  const servicios = await servicioRepository.findByUsuario(usuarioId);
  return servicios.map(toDTO);
}

export async function createServicioUseCase(
  usuarioId: string,
  data: { nombre: string; montoDestinado: number },
) {
  await assertSaldoSuficiente(usuarioId, data.montoDestinado);
  const servicio = await servicioRepository.create(usuarioId, data);
  return toDTO(servicio);
}

export async function updateServicioUseCase(
  usuarioId: string,
  id: string,
  data: { nombre?: string; montoDestinado?: number },
) {
  const servicio = await servicioRepository.findById(id);
  if (!servicio || servicio.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Servicio no encontrado');
  }

  if (data.montoDestinado !== undefined) {
    const delta = data.montoDestinado - servicio.montoDestinado.toNumber();
    await assertSaldoSuficiente(usuarioId, delta);
  }

  const updated = await servicioRepository.update(id, data);
  return toDTO(updated);
}

export async function deleteServicioUseCase(usuarioId: string, id: string) {
  const servicio = await servicioRepository.findById(id);
  if (!servicio || servicio.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Servicio no encontrado');
  }

  return servicioRepository.remove(id);
}

async function assertSaldoSuficiente(usuarioId: string, montoAdicional: number) {
  const sueldo = await sueldoRepository.findByUsuario(usuarioId);
  if (!sueldo) {
    throw new HttpError(400, 'Debés registrar tu sueldo antes de crear servicios');
  }

  const totalDestinado = await servicioRepository.sumMontoDestinado(usuarioId);
  const nuevoTotal = totalDestinado.plus(montoAdicional);

  if (nuevoTotal.greaterThan(sueldo.monto)) {
    throw new HttpError(400, 'El sueldo no alcanza para este servicio');
  }
}
