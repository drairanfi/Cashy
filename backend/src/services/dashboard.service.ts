import { sueldoRepository } from '../repositories/sueldo.repository.js';
import { servicioRepository } from '../repositories/servicio.repository.js';
import { metaRepository } from '../repositories/meta.repository.js';
import { gastoRepository } from '../repositories/gasto.repository.js';
import { comidaRepository } from '../repositories/comida.repository.js';
import { gimnasioRepository } from '../repositories/gimnasio.repository.js';
import { ahorroRepository } from '../repositories/ahorro.repository.js';

export async function getDashboardUseCase(usuarioId: string) {
  const [sueldo, servicios, metas, gastos, comidas, gimnasio, ahorros] = await Promise.all([
    sueldoRepository.findByUsuario(usuarioId),
    servicioRepository.findByUsuario(usuarioId),
    metaRepository.findByUsuario(usuarioId),
    gastoRepository.findByUsuario(usuarioId),
    comidaRepository.findByUsuario(usuarioId),
    gimnasioRepository.findByUsuario(usuarioId),
    ahorroRepository.findByUsuario(usuarioId),
  ]);

  const sueldoMonto = sueldo?.monto.toNumber() ?? 0;

  const totalServicios = servicios.reduce((acc, s) => acc + s.montoDestinado.toNumber(), 0);
  const totalMetas = metas.reduce((acc, m) => acc + m.montoMensual.toNumber(), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto.toNumber(), 0);
  const totalComidas = comidas.reduce((acc, c) => acc + c.monto.toNumber(), 0);
  const totalGimnasio = gimnasio.reduce((acc, r) => acc + r.monto.toNumber(), 0);
  const totalAhorros = ahorros.reduce((acc, a) => acc + a.actual.toNumber(), 0);

  const gastosTotales = totalServicios + totalGastos + totalComidas + totalGimnasio;
  const ahorrosTotales = totalMetas + totalAhorros;

  return {
    sueldo: sueldoMonto,
    ingresos: sueldoMonto,
    gastos: gastosTotales,
    ahorros: ahorrosTotales,
    saldoDisponible: sueldoMonto - gastosTotales - ahorrosTotales,
    totalServicios: servicios.length,
    totalMetas: metas.length,
  };
}
