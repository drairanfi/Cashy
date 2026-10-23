import type { Cuenta, Prisma } from '@prisma/client';
import { cuentaRepository } from '../repositories/cuenta.repository.js';
import { moduloRepository } from '../repositories/modulo.repository.js';
import { registroModuloPersonalizadoRepository } from '../repositories/registro-modulo-personalizado.repository.js';
import { HttpError } from '../utils/httpError.js';
import type { CreateCuentaInput, UpdateCuentaInput } from '../schemas/cuenta.schema.js';

type SumaPorCuenta = { cuentaId: string | null; _sum: { monto: Prisma.Decimal | null } };

function centsOf(monto: Prisma.Decimal | null): number {
  return monto ? Math.round(monto.toNumber() * 100) : 0;
}

function buildSpendMap(...grupos: SumaPorCuenta[][]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const filas of grupos) {
    for (const fila of filas) {
      if (!fila.cuentaId) continue;
      const previo = mapa.get(fila.cuentaId) ?? 0;
      mapa.set(fila.cuentaId, previo + centsOf(fila._sum.monto));
    }
  }
  return mapa;
}

async function spendMapForUser(usuarioId: string) {
  const activos = await moduloRepository.findActivoClaves(usuarioId);
  const [gastos, comidas, gimnasio, personalizados] = await Promise.all([
    activos.has('gastos') ? cuentaRepository.sumGastosPorCuenta(usuarioId) : [],
    activos.has('comida') ? cuentaRepository.sumComidasPorCuenta(usuarioId) : [],
    activos.has('gimnasio') ? cuentaRepository.sumGimnasioPorCuenta(usuarioId) : [],
    registroModuloPersonalizadoRepository.sumPorCuentaActivos(usuarioId),
  ]);
  return buildSpendMap(gastos, comidas, gimnasio, personalizados);
}

function cuentaDTO(cuenta: Cuenta, gastadoCents: number) {
  const saldoCents = Math.round(cuenta.saldoInicial.toNumber() * 100);
  return {
    id: cuenta.id,
    nombre: cuenta.nombre,
    tipo: cuenta.tipo,
    saldoInicial: cuenta.saldoInicial.toNumber(),
    balance: (saldoCents - gastadoCents) / 100,
  };
}

export async function listCuentasUseCase(usuarioId: string) {
  const [cuentas, mapa] = await Promise.all([
    cuentaRepository.findByUsuario(usuarioId),
    spendMapForUser(usuarioId),
  ]);

  return cuentas.map((cuenta) => cuentaDTO(cuenta, mapa.get(cuenta.id) ?? 0));
}

export async function createCuentaUseCase(usuarioId: string, data: CreateCuentaInput) {
  const cuenta = await cuentaRepository.create(usuarioId, {
    nombre: data.nombre,
    tipo: data.tipo,
    saldoInicial: data.saldoInicial,
  });
  return cuentaDTO(cuenta, 0);
}

export async function updateCuentaUseCase(
  usuarioId: string,
  id: string,
  data: UpdateCuentaInput,
) {
  const cuenta = await cuentaRepository.findById(id);
  if (!cuenta || cuenta.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Cuenta no encontrada');
  }

  const actualizada = await cuentaRepository.update(id, data);
  const mapa = await spendMapForUser(usuarioId);
  return cuentaDTO(actualizada, mapa.get(actualizada.id) ?? 0);
}

export async function deleteCuentaUseCase(usuarioId: string, id: string) {
  const cuenta = await cuentaRepository.findById(id);
  if (!cuenta || cuenta.usuarioId !== usuarioId) {
    throw new HttpError(404, 'Cuenta no encontrada');
  }

  return cuentaRepository.removeYDesvincular(id);
}
