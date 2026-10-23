import type { ModuloPersonalizado } from '@prisma/client';
import { moduloPersonalizadoRepository } from '../repositories/modulo-personalizado.repository.js';
import type {
  CreateModuloPersonalizadoInput,
  UpdateModuloPersonalizadoInput,
} from '../schemas/modulo-personalizado.schema.js';
import { HttpError } from '../utils/httpError.js';

function toDTO(modulo: ModuloPersonalizado) {
  return { id: modulo.id, nombre: modulo.nombre, activo: modulo.activo };
}

async function findOwned(usuarioId: string, id: string) {
  const modulo = await moduloPersonalizadoRepository.findById(id);
  if (!modulo || modulo.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Módulo no encontrado');
  }
  return modulo;
}

export async function listModulosPersonalizadosUseCase(usuarioId: string) {
  const modulos = await moduloPersonalizadoRepository.findByUsuario(usuarioId);
  return modulos.map(toDTO);
}

export async function createModuloPersonalizadoUseCase(
  usuarioId: string,
  data: CreateModuloPersonalizadoInput,
) {
  const modulo = await moduloPersonalizadoRepository.create(usuarioId, data.nombre);
  return toDTO(modulo);
}

export async function updateModuloPersonalizadoUseCase(
  usuarioId: string,
  id: string,
  data: UpdateModuloPersonalizadoInput,
) {
  await findOwned(usuarioId, id);
  const modulo = await moduloPersonalizadoRepository.update(id, data);
  return toDTO(modulo);
}

export async function deleteModuloPersonalizadoUseCase(usuarioId: string, id: string) {
  await findOwned(usuarioId, id);
  await moduloPersonalizadoRepository.remove(id);
}
