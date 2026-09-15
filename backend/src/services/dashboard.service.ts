import { sueldoRepository } from '../repositories/sueldo.repository.js';
import { servicioRepository } from '../repositories/servicio.repository.js';
import { metaRepository } from '../repositories/meta.repository.js';

export async function getDashboardUseCase(usuarioId: string) {
  const [sueldo, servicios, metas] = await Promise.all([
    sueldoRepository.findByUsuario(usuarioId),
    servicioRepository.findByUsuario(usuarioId),
    metaRepository.findByUsuario(usuarioId),
  ]);

  const sueldoMonto = sueldo?.monto.toNumber() ?? 0;
  const gastos = servicios.reduce((acc, s) => acc + s.montoDestinado.toNumber(), 0);
  const ahorros = metas.reduce((acc, m) => acc + m.montoMensual.toNumber(), 0);

  return {
    sueldo: sueldoMonto,
    ingresos: sueldoMonto,
    gastos,
    ahorros,
    saldoDisponible: sueldoMonto - gastos - ahorros,
    totalServicios: servicios.length,
    totalMetas: metas.length,
  };
}
