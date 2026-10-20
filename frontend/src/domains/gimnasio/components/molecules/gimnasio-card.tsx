import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import type { GimnasioRegistro } from '@/types/gimnasio.types';
import { categoriaTone } from '@/utils/categoria-tone.util';
import { formatCurrency } from '@/utils/format.util';

import { gimnasioMessages } from '../../messages';

interface GimnasioCardProps {
  registro: GimnasioRegistro;
  onDelete: (registro: GimnasioRegistro) => void;
}

export function GimnasioCard({ registro, onDelete }: GimnasioCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{registro.actividad}</p>
        <Badge tone={categoriaTone(gimnasioMessages.card.badge)} className="mt-1">
          {gimnasioMessages.card.badge}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-semibold text-foreground">{formatCurrency(registro.monto)}</span>
        <button
          type="button"
          onClick={() => onDelete(registro)}
          aria-label={gimnasioMessages.card.delete}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
