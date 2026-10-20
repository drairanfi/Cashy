'use client';

import { Receipt } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { useComidas } from '@/domains/comidas/hooks/use-comidas';
import { useGastos } from '@/domains/gastos/hooks/use-gastos';
import { useGimnasio } from '@/domains/gimnasio/hooks/use-gimnasio';
import type { Movimiento } from '@/types/movimiento.types';

import { MovementRow } from '../molecules/movement-row';
import { dashboardMessages } from '../../messages';

const LIMIT = 8;

export function RecentMovements() {
  const { data: gastos = [], isLoading: isLoadingGastos } = useGastos();
  const { data: comidas = [], isLoading: isLoadingComidas } = useComidas();
  const { data: gimnasio = [], isLoading: isLoadingGimnasio } = useGimnasio();

  const isLoading = isLoadingGastos || isLoadingComidas || isLoadingGimnasio;

  const movimientos: Movimiento[] = [
    ...gastos.map(gasto => ({
      id: gasto.id,
      tipo: 'gasto' as const,
      titulo: gasto.descripcion,
      monto: gasto.monto,
      fecha: gasto.fecha,
      categoria: gasto.categoria
    })),
    ...comidas.map(comida => ({
      id: comida.id,
      tipo: 'comida' as const,
      titulo: comida.descripcion,
      monto: comida.monto,
      fecha: comida.fecha
    })),
    ...gimnasio.map(registro => ({
      id: registro.id,
      tipo: 'gimnasio' as const,
      titulo: registro.actividad,
      monto: registro.monto,
      fecha: registro.fecha
    }))
  ]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, LIMIT);

  return (
    <section className="flex flex-col gap-3" aria-busy={isLoading}>
      <h2 className="text-lg font-semibold text-foreground">
        {dashboardMessages.recentMovements.title}
      </h2>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : movimientos.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-5" />}
          title={dashboardMessages.recentMovements.empty.title}
          text={dashboardMessages.recentMovements.empty.text}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {movimientos.map(movimiento => (
            <MovementRow key={`${movimiento.tipo}-${movimiento.id}`} movimiento={movimiento} />
          ))}
        </div>
      )}
    </section>
  );
}
