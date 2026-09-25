import type { Comida } from '@prisma/client';
import { comidaRepository } from '../repositories/comida.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { CreateComidaInput } from '../schemas/comida.schema.js';

function toDTO(comida: Comida) {
  return {
    id: comida.id,
    descripcion: comida.descripcion,
    monto: comida.monto.toNumber(),
    fecha: comida.fecha.toISOString(),
  };
}

export async function listComidasUseCase(usuarioId: string) {
  const comidas = await comidaRepository.findByUsuario(usuarioId);
  return comidas.map(toDTO);
}

export async function createComidaUseCase(usuarioId: string, data: CreateComidaInput) {
  const comida = await comidaRepository.create(usuarioId, data);
  return toDTO(comida);
}

export async function deleteComidaUseCase(usuarioId: string, id: string) {
  const comida = await comidaRepository.findById(id);
  if (!comida || comida.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Comida no encontrada');
  }

  return comidaRepository.remove(id);
}
