import type { Ahorro } from '@prisma/client';
import { ahorroRepository } from '../repositories/ahorro.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { AporteAhorroInput, CreateAhorroInput } from '../schemas/ahorro.schema.js';

function toDTO(ahorro: Ahorro) {
  return {
    id: ahorro.id,
    nombre: ahorro.nombre,
    objetivo: ahorro.objetivo.toNumber(),
    actual: ahorro.actual.toNumber(),
  };
}

export async function listAhorrosUseCase(usuarioId: string) {
  const ahorros = await ahorroRepository.findByUsuario(usuarioId);
  return ahorros.map(toDTO);
}

export async function createAhorroUseCase(usuarioId: string, data: CreateAhorroInput) {
  const ahorro = await ahorroRepository.create(usuarioId, data);
  return toDTO(ahorro);
}

export async function aportarAhorroUseCase(
  usuarioId: string,
  id: string,
  data: AporteAhorroInput,
) {
  const ahorro = await ahorroRepository.findById(id);
  if (!ahorro || ahorro.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Meta de ahorro no encontrada');
  }

  const updated = await ahorroRepository.addAporte(id, data.monto);
  return toDTO(updated);
}

export async function deleteAhorroUseCase(usuarioId: string, id: string) {
  const ahorro = await ahorroRepository.findById(id);
  if (!ahorro || ahorro.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Meta de ahorro no encontrada');
  }

  return ahorroRepository.remove(id);
}
