import { Pause, Play, Trash2 } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { recurrentesMessages } from '../../messages';
import type { Recurrente, RecurrenteEstado } from '../../types/recurrente.types';

const ESTADO_TONES: Record<RecurrenteEstado, BadgeTone> = {
  activa: 'success',
  pausada: 'warning'
};

interface RecurrenteCardProps {
  recurrente: Recurrente;
  onToggleEstado: (recurrente: Recurrente) => void;
  onDelete: (recurrente: Recurrente) => void;
}

export function RecurrenteCard({ recurrente, onToggleEstado, onDelete }: RecurrenteCardProps) {
  const label = recurrentesMessages.frequency[recurrente.frecuencia];
  const isPaused = recurrente.estado === 'pausada';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{recurrente.concepto}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">
              {recurrentesMessages.intervalBadge(label, recurrente.intervalo)}
            </Badge>
            <Badge tone={ESTADO_TONES[recurrente.estado]}>
              {recurrentesMessages.estado[recurrente.estado]}
            </Badge>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {formatCurrency(recurrente.monto)}
        </span>
      </div>

      {recurrente.categoria && (
        <p className="text-sm text-muted-foreground">
          {recurrentesMessages.card.category(recurrente.categoria)}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {recurrente.proximaOcurrencia
            ? recurrentesMessages.card.next(formatDate(recurrente.proximaOcurrencia))
            : recurrentesMessages.card.noNext}
        </span>
        <span>{recurrentesMessages.card.pending(recurrente.pendientes)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleEstado(recurrente)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors',
            isPaused
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          )}
        >
          {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          {isPaused ? recurrentesMessages.card.resume : recurrentesMessages.card.pause}
        </button>
        <button
          type="button"
          onClick={() => onDelete(recurrente)}
          aria-label={recurrentesMessages.card.delete}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
