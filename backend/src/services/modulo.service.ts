import { moduloRepository } from '../repositories/modulo.repository.js';
import { MODULO_CLAVES, isModuloClave, type ModuloClave } from '../schemas/modulo.schema.js';
import { HttpError } from '../utils/httpError.js';

function assertModuloClave(clave: string): ModuloClave {
  if (!isModuloClave(clave)) {
    throw new HttpError(404, 'Módulo no encontrado');
  }
  return clave;
}

export async function listModulosUseCase(usuarioId: string) {
  const filas = await moduloRepository.findByUsuario(usuarioId);
  return MODULO_CLAVES.map((clave) => ({
    clave,
    activo: filas.find((fila) => fila.clave === clave)?.activo ?? false,
  }));
}

export async function getAlcanceModulosUseCase(usuarioId: string) {
  const activos = await moduloRepository.findActivoClaves(usuarioId);
  return {
    gastos: activos.has('gastos'),
    comida: activos.has('comida'),
    gimnasio: activos.has('gimnasio'),
    ahorros: activos.has('ahorros'),
    deudas: activos.has('deudas'),
    metas: activos.has('metas'),
  };
}

export async function setModuloActivoUseCase(usuarioId: string, clave: string, activo: boolean) {
  const claveValida = assertModuloClave(clave);
  await moduloRepository.setActivo(usuarioId, claveValida, activo);
  return { clave: claveValida, activo };
}

export async function deleteModuloDatosUseCase(usuarioId: string, clave: string) {
  const claveValida = assertModuloClave(clave);
  await moduloRepository.removeDatosYDesactivar(usuarioId, claveValida);
  return { clave: claveValida, activo: false };
}
