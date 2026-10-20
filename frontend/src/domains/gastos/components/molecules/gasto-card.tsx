import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import type { Gasto } from '@/types/gasto.types';
import { categoriaTone } from '@/utils/categoria-tone.util';
import { formatCurrency } from '@/utils/format.util';

import { gastosMessages } from '../../messages';

interface GastoCardProps {
  gasto: Gasto;
  onDelete: (gasto: Gasto) => void;
}

export function GastoCard({ gasto, onDelete }: GastoCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{gasto.descripcion}</p>
        <Badge tone={categoriaTone(gasto.categoria)} className="mt-1">
          {gasto.categoria}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-semibold text-foreground">{formatCurrency(gasto.monto)}</span>
        <button
          type="button"
          onClick={() => onDelete(gasto)}
          aria-label={gastosMessages.card.delete}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
