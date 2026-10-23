import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { IconAction } from '@/components/molecules/icon-action';
import type { Gasto } from '@/types/gasto.types';
import { categoriaTone } from '@/utils/categoria-tone.util';
import { formatCurrency } from '@/utils/format.util';

import { gastosMessages } from '../../messages';

interface GastoCardProps {
  gasto: Gasto;
  onEdit: (gasto: Gasto) => void;
  onDelete: (gasto: Gasto) => void;
}

export function GastoCard({ gasto, onEdit, onDelete }: GastoCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{gasto.descripcion}</p>
        <Badge tone={categoriaTone(gasto.categoria)} className="mt-1">
          {gasto.categoria}
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-2 font-semibold text-foreground">{formatCurrency(gasto.monto)}</span>
        <IconAction label={gastosMessages.card.edit} icon={Pencil} onClick={() => onEdit(gasto)} />
        <IconAction
          label={gastosMessages.card.delete}
          icon={Trash2}
          onClick={() => onDelete(gasto)}
          destructive
        />
      </div>
    </div>
  );
}
