import { Pencil } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { IconAction } from '@/components/molecules/icon-action';
import type { Meta } from '@/types/meta.types';
import { formatCurrency } from '@/utils/format.util';

import { metasMessages } from '../../messages';

interface MetaCardProps {
  meta: Meta;
  onEdit: (meta: Meta) => void;
}

export function MetaCard({ meta, onEdit }: MetaCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{meta.nombre}</p>
          {meta.prioritaria && (
            <Badge tone="neutral" className="mt-1">
              {metasMessages.card.bigBadge}
            </Badge>
          )}
        </div>
        <IconAction label={metasMessages.card.edit} icon={Pencil} onClick={() => onEdit(meta)} />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{formatCurrency(meta.montoObjetivo)}</p>
        <p className="text-sm text-muted-foreground">
          {metasMessages.card.perMonth(formatCurrency(meta.montoMensual))}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {metasMessages.card.range(
            new Date(meta.fechaInicio).toLocaleDateString('es-CO'),
            meta.fechaFin ? new Date(meta.fechaFin).toLocaleDateString('es-CO') : null
          )}
        </p>
        {meta.mesesParaAlcanzar !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {metasMessages.card.monthsToReach(meta.mesesParaAlcanzar)}
          </p>
        )}
      </div>
    </div>
  );
}
