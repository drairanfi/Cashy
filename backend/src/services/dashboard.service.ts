import { metaRepository } from '../repositories/meta.repository.js';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { comidaRepository } from '../repositories/comida.repository.js';
import { gimnasioRepository } from '../repositories/gimnasio.repository.js';
import { ahorroRepository } from '../repositories/ahorro.repository.js';
import { cuentaRepository } from '../repositories/cuenta.repository.js';
import { registroModuloPersonalizadoRepository } from '../repositories/registro-modulo-personalizado.repository.js';
import { getAlcanceModulosUseCase } from './modulo.service.js';
import { listCuentasUseCase } from './cuenta.service.js';

export async function getDashboardUseCase(usuarioId: string) {
  const [cuentasTodas, metasTodas, gastosTodos, comidasTodas, gimnasioTodo, ahorrosTodos, cuentas, alcance] =
    await Promise.all([
      cuentaRepository.findByUsuario(usuarioId),
      metaRepository.findByUsuario(usuarioId),
      gastoRepository.findByUsuario(usuarioId),
      comidaRepository.findByUsuario(usuarioId),
      gimnasioRepository.findByUsuario(usuarioId),
      ahorroRepository.findByUsuario(usuarioId),
      listCuentasUseCase(usuarioId),
      getAlcanceModulosUseCase(usuarioId),
    ]);

  const metas = alcance.metas ? metasTodas : [];
  const gastos = alcance.gastos ? gastosTodos : [];
  const comidas = alcance.comida ? comidasTodas : [];
  const gimnasio = alcance.gimnasio ? gimnasioTodo : [];
  const ahorros = alcance.ahorros ? ahorrosTodos : [];

  const sueldoMonto = cuentasTodas.reduce((acc, c) => acc + c.saldoInicial.toNumber(), 0);

  const totalMetas = metas.reduce((acc, m) => acc + m.montoMensual.toNumber(), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto.toNumber(), 0);
  const totalComidas = comidas.reduce((acc, c) => acc + c.monto.toNumber(), 0);
  const totalGimnasio = gimnasio.reduce((acc, r) => acc + r.monto.toNumber(), 0);
  const totalAhorros = ahorros.reduce((acc, a) => acc + a.actual.toNumber(), 0);

  const registrosPersonalizados = await registroModuloPersonalizadoRepository.findActivosByUsuario(usuarioId);
  const totalPersonalizados = registrosPersonalizados.reduce((acc, r) => acc + r.monto.toNumber(), 0);

  const gastosTotales = totalGastos + totalComidas + totalGimnasio + totalPersonalizados;
  const ahorrosTotales = totalMetas + totalAhorros;

  return {
    sueldo: sueldoMonto,
    ingresos: sueldoMonto,
    gastos: gastosTotales,
    ahorros: ahorrosTotales,
    saldoDisponible: sueldoMonto - gastosTotales - ahorrosTotales,
    totalMetas: metas.length,
    cuentas: cuentas.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      saldoInicial: c.saldoInicial,
      balance: c.balance,
    })),
  };
}
