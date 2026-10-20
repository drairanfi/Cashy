import { ChevronDown, Trash2 } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/atoms/badge';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { cn } from '@/lib/utils';
import type { DeudaDireccion, DeudaResumen } from '@/types/deuda.types';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { deudasMessages } from '../../messages';

const DIRECTION_TONES: Record<DeudaDireccion, BadgeTone> = {
  debida: 'danger',
  'a_cobrar': 'success'
};

interface DeudaCardProps {
  deuda: DeudaResumen;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onDelete: (deuda: DeudaResumen) => void;
}

export function DeudaCard({ deuda, isExpanded, onToggle, onDelete }: DeudaCardProps) {
  const percentage =
    deuda.totalCuotas > 0
      ? Math.min(100, Math.round((deuda.cuotasPagadas / deuda.totalCuotas) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{deuda.nombre}</p>
          <Badge tone={DIRECTION_TONES[deuda.direccion]} className="mt-1">
            {deudasMessages.direction[deuda.direccion]}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => onDelete(deuda)}
          aria-label={deudasMessages.card.delete}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <ProgressBar value={percentage} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {deudasMessages.card.installments(deuda.cuotasPagadas, deuda.totalCuotas)}
        </p>
        <span className="text-sm font-medium text-foreground">{percentage}%</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {deudasMessages.card.pending(formatCurrency(deuda.montoPendiente))}
        </span>
        <span className="text-sm text-muted-foreground">
          {deuda.proximaFecha
            ? deudasMessages.card.next(formatDate(deuda.proximaFecha))
            : deudasMessages.card.noNext}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(deuda.id)}
        aria-expanded={isExpanded}
        className="flex items-center gap-1.5 self-start text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <ChevronDown
          className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
        />
        {isExpanded ? deudasMessages.card.hideInstallments : deudasMessages.card.showInstallments}
      </button>
    </div>
  );
}
