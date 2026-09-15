import type { Meta } from '@prisma/client';
import { metaRepository } from '../repositories/meta.repository.js';
import { HttpError } from '../utils/httpError.js';

function toDTO(meta: Meta) {
  const montoObjetivo = meta.montoObjetivo.toNumber();
  const montoMensual = meta.montoMensual.toNumber();

  return {
    ...meta,
    montoObjetivo,
    montoMensual,
    mesesParaAlcanzar: montoMensual > 0 ? Math.ceil(montoObjetivo / montoMensual) : null,
  };
}

export async function listMetasUseCase(usuarioId: string) {
  const metas = await metaRepository.findByUsuario(usuarioId);
  return metas.map(toDTO);
}

export async function createMetaUseCase(
  usuarioId: string,
  data: { nombre: string; montoObjetivo: number; montoMensual: number },
) {
  const meta = await metaRepository.create(usuarioId, data);
  return toDTO(meta);
}

export async function updateMetaUseCase(
  usuarioId: string,
  id: string,
  data: { nombre?: string; montoObjetivo?: number; montoMensual?: number },
) {
  const meta = await metaRepository.findById(id);
  if (!meta || meta.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Meta no encontrada');
  }

  const updated = await metaRepository.update(id, data);
  return toDTO(updated);
}

export async function deleteMetaUseCase(usuarioId: string, id: string) {
  const meta = await metaRepository.findById(id);
  if (!meta || meta.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Meta no encontrada');
  }

  return metaRepository.remove(id);
}
