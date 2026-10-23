import { moduloPersonalizadoRepository } from '../repositories/modulo-personalizado.repository.js';
import { registroModuloPersonalizadoRepository } from '../repositories/registro-modulo-personalizado.repository.js';
import type { CreateRegistroModuloPersonalizadoInput } from '../schemas/registro-modulo-personalizado.schema.js';
import { HttpError } from '../utils/httpError.js';

function toDTO(registro: {
  id: string;
  descripcion: string;
  monto: { toNumber(): number };
  cuentaId: string | null;
  fecha: Date;
}) {
  return {
    id: registro.id,
    descripcion: registro.descripcion,
    monto: registro.monto.toNumber(),
    cuentaId: registro.cuentaId,
    fecha: registro.fecha.toISOString(),
  };
}

async function findOwnedModulo(usuarioId: string, moduloId: string) {
  const modulo = await moduloPersonalizadoRepository.findById(moduloId);
  if (!modulo || modulo.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Módulo no encontrado');
  }
  return modulo;
}

export async function listRegistrosModuloUseCase(usuarioId: string, moduloId: string) {
  await findOwnedModulo(usuarioId, moduloId);
  const registros = await registroModuloPersonalizadoRepository.findByModulo(moduloId);
  return registros.map(toDTO);
}

export async function createRegistroModuloUseCase(
  usuarioId: string,
  moduloId: string,
  data: CreateRegistroModuloPersonalizadoInput,
) {
  await findOwnedModulo(usuarioId, moduloId);
  const registro = await registroModuloPersonalizadoRepository.create(usuarioId, moduloId, {
    descripcion: data.descripcion,
    monto: data.monto,
    cuentaId: data.cuentaId ?? null,
  });
  return toDTO(registro);
}

export async function deleteRegistroModuloUseCase(
  usuarioId: string,
  moduloId: string,
  registroId: string,
) {
  await findOwnedModulo(usuarioId, moduloId);
  const registro = await registroModuloPersonalizadoRepository.findById(registroId);
  if (!registro || registro.moduloId !== moduloId || registro.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Registro no encontrado');
  }
  await registroModuloPersonalizadoRepository.remove(registroId);
}
