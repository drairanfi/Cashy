import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format.util';

import { cuentasMessages } from '../../messages';
import type { Cuenta } from '../../types/cuenta.types';

interface CuentaCardProps {
  cuenta: Cuenta;
  onEdit: (cuenta: Cuenta) => void;
  onDelete: (cuenta: Cuenta) => void;
}

export function CuentaCard({ cuenta, onEdit, onDelete }: CuentaCardProps) {
  const isNegative = cuenta.balance < 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{cuenta.nombre}</p>
          <Badge tone="neutral" className="mt-1">
            {cuentasMessages.type[cuenta.tipo]}
          </Badge>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(cuenta)}
            aria-label={cuentasMessages.card.edit}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cuenta)}
            aria-label={cuentasMessages.card.delete}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {cuentasMessages.card.initial(formatCurrency(cuenta.saldoInicial))}
        </span>
        <span
          className={cn(
            'text-lg font-semibold',
            isNegative ? 'text-rose-600' : 'text-emerald-600'
          )}
        >
          {formatCurrency(cuenta.balance)}
        </span>
      </div>
    </div>
  );
}
