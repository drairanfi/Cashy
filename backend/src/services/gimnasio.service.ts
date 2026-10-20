import type { Gimnasio } from '@prisma/client';
import { gimnasioRepository } from '../repositories/gimnasio.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { CreateGimnasioInput } from '../schemas/gimnasio.schema.js';

function toDTO(registro: Gimnasio) {
  return {
    id: registro.id,
    actividad: registro.actividad,
    monto: registro.monto.toNumber(),
    cuentaId: registro.cuentaId,
    fecha: registro.fecha.toISOString(),
  };
}

export async function listGimnasioUseCase(usuarioId: string) {
  const registros = await gimnasioRepository.findByUsuario(usuarioId);
  return registros.map(toDTO);
}

export async function createGimnasioUseCase(usuarioId: string, data: CreateGimnasioInput) {
  const registro = await gimnasioRepository.create(usuarioId, data);
  return toDTO(registro);
}

export async function deleteGimnasioUseCase(usuarioId: string, id: string) {
  const registro = await gimnasioRepository.findById(id);
  if (!registro || registro.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Actividad no encontrada');
  }

  return gimnasioRepository.remove(id);
}
