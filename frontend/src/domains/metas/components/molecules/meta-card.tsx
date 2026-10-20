import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import type { Meta } from '@/types/meta.types';
import { formatCurrency } from '@/utils/format.util';

import { metasMessages } from '../../messages';

interface MetaCardProps {
  meta: Meta;
  onEdit: (meta: Meta) => void;
}

export function MetaCard({ meta, onEdit }: MetaCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        meta.prioritaria ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{meta.nombre}</p>
          {meta.prioritaria && (
            <Badge tone="success" className="mt-1">
              {metasMessages.card.bigBadge}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => onEdit(meta)}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {metasMessages.card.edit}
        </button>
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">
        {formatCurrency(meta.montoObjetivo)}
      </p>
      <p className="text-sm text-muted-foreground">
        {metasMessages.card.perMonth(formatCurrency(meta.montoMensual))}
      </p>
      {meta.mesesParaAlcanzar !== null && (
        <p className="mt-1 text-xs text-muted-foreground">
          {metasMessages.card.monthsToReach(meta.mesesParaAlcanzar)}
        </p>
      )}
    </div>
  );
}
