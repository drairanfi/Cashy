import type { Gasto } from '@prisma/client';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { CreateGastoInput } from '../schemas/gasto.schema.js';

function toDTO(gasto: Gasto) {
  return {
    id: gasto.id,
    descripcion: gasto.descripcion,
    monto: gasto.monto.toNumber(),
    categoria: gasto.categoria,
    fecha: gasto.fecha.toISOString(),
  };
}

export async function listGastosUseCase(usuarioId: string) {
  const gastos = await gastoRepository.findByUsuario(usuarioId);
  return gastos.map(toDTO);
}

export async function createGastoUseCase(usuarioId: string, data: CreateGastoInput) {
  const gasto = await gastoRepository.create(usuarioId, data);
  return toDTO(gasto);
}

export async function deleteGastoUseCase(usuarioId: string, id: string) {
  const gasto = await gastoRepository.findById(id);
  if (!gasto || gasto.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Gasto no encontrado');
  }

  return gastoRepository.remove(id);
}
