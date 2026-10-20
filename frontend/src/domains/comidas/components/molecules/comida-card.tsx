import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import type { Comida } from '@/types/comida.types';
import { categoriaTone } from '@/utils/categoria-tone.util';
import { formatCurrency } from '@/utils/format.util';

import { comidasMessages } from '../../messages';

interface ComidaCardProps {
  comida: Comida;
  onDelete: (comida: Comida) => void;
}

export function ComidaCard({ comida, onDelete }: ComidaCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{comida.descripcion}</p>
        <Badge tone={categoriaTone(comidasMessages.card.badge)} className="mt-1">
          {comidasMessages.card.badge}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-semibold text-foreground">{formatCurrency(comida.monto)}</span>
        <button
          type="button"
          onClick={() => onDelete(comida)}
          aria-label={comidasMessages.card.delete}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
