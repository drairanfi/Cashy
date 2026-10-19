import { useGastos } from '@/hooks/useGastos';
import { useComidas } from '@/hooks/useComidas';
import { useGimnasio } from '@/hooks/useGimnasio';
import type { Movimiento, MovimientoTipo } from '@/types';
import { MovimientoRow } from '@/components/molecules/MovimientoRow';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ListSkeleton } from '@/components/molecules/ListSkeleton';
import { ReceiptIcon } from '@/components/atoms/Icon';

const LIMITE = 8;

const RUTAS: Record<MovimientoTipo, string> = {
  gasto: '/gastos',
  comida: '/comida',
  gimnasio: '/gimnasio',
};

export function UltimosMovimientos() {
  const { data: gastos = [], isLoading: loadingGastos } = useGastos();
  const { data: comidas = [], isLoading: loadingComidas } = useComidas();
  const { data: gimnasio = [], isLoading: loadingGimnasio } = useGimnasio();

  const isLoading = loadingGastos || loadingComidas || loadingGimnasio;

  const movimientos: Movimiento[] = [
    ...gastos.map((gasto) => ({
      id: gasto.id,
      tipo: 'gasto' as const,
      titulo: gasto.descripcion,
      monto: gasto.monto,
      fecha: gasto.fecha,
      categoria: gasto.categoria,
    })),
    ...comidas.map((comida) => ({
      id: comida.id,
      tipo: 'comida' as const,
      titulo: comida.descripcion,
      monto: comida.monto,
      fecha: comida.fecha,
    })),
    ...gimnasio.map((registro) => ({
      id: registro.id,
      tipo: 'gimnasio' as const,
      titulo: registro.actividad,
      monto: registro.monto,
      fecha: registro.fecha,
    })),
  ]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, LIMITE);

  return (
    <section className="section" aria-busy={isLoading}>
      <div className="section__header">
        <h2 className="section__title">Últimos movimientos</h2>
      </div>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : movimientos.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="Todavía no cargaste movimientos"
          text="Registrá un gasto, una comida o una actividad para verlos acá."
        />
      ) : (
        <div className="section__list">
          {movimientos.map((movimiento) => (
            <MovimientoRow
              key={`${movimiento.tipo}-${movimiento.id}`}
              to={RUTAS[movimiento.tipo]}
              tipo={movimiento.tipo}
              titulo={movimiento.titulo}
              monto={movimiento.monto}
              fecha={movimiento.fecha}
              categoria={movimiento.categoria}
            />
          ))}
        </div>
      )}
    </section>
  );
}
