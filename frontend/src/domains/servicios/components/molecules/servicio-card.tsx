import type { Servicio } from '@/types/servicio.types';
import { formatCurrency } from '@/utils/format.util';

import { serviciosMessages } from '../../messages';

interface ServicioCardProps {
  servicio: Servicio;
  onEdit: (servicio: Servicio) => void;
}

export function ServicioCard({ servicio, onEdit }: ServicioCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{servicio.nombre}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(servicio.montoDestinado)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(servicio)}
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        {serviciosMessages.card.edit}
      </button>
    </div>
  );
}
