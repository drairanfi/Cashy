import Link from 'next/link';

import { Badge, type BadgeTone } from '@/components/atoms/badge';
import type { Movimiento, MovimientoTipo } from '@/types/movimiento.types';
import { categoriaTone } from '@/utils/categoria-tone.util';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { dashboardMessages } from '../../messages';

const TYPE_TONES: Record<MovimientoTipo, BadgeTone> = {
  gasto: 'danger',
  comida: 'warning',
  gimnasio: 'success'
};

const TYPE_ROUTES: Record<MovimientoTipo, string> = {
  gasto: '/gastos',
  comida: '/comida',
  gimnasio: '/gimnasio'
};

interface MovementRowProps {
  movimiento: Movimiento;
}

export function MovementRow({ movimiento }: MovementRowProps) {
  return (
    <Link
      href={TYPE_ROUTES[movimiento.tipo]}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{movimiento.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone={TYPE_TONES[movimiento.tipo]}>
            {dashboardMessages.recentMovements.types[movimiento.tipo]}
          </Badge>
          {movimiento.categoria && (
            <Badge tone={categoriaTone(movimiento.categoria)}>{movimiento.categoria}</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(movimiento.fecha)}
          </span>
        </div>
      </div>
      <span className="shrink-0 font-semibold text-foreground">
        {formatCurrency(movimiento.monto)}
      </span>
    </Link>
  );
}
