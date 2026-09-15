import { sueldoRepository } from '../repositories/sueldo.repository.js';

export async function getSueldoUseCase(usuarioId: string) {
  const sueldo = await sueldoRepository.findByUsuario(usuarioId);
  return sueldo ? { ...sueldo, monto: sueldo.monto.toNumber() } : null;
}

export async function upsertSueldoUseCase(usuarioId: string, monto: number) {
  const sueldo = await sueldoRepository.upsert(usuarioId, monto);
  return { ...sueldo, monto: sueldo.monto.toNumber() };
}
