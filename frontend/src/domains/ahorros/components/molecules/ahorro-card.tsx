import { Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { ProgressBar } from '@/components/atoms/progress-bar';
import type { Ahorro } from '@/types/ahorro.types';
import { formatCurrency } from '@/utils/format.util';

import { ahorrosMessages } from '../../messages';

interface AhorroCardProps {
  ahorro: Ahorro;
  onContribute: (ahorro: Ahorro) => void;
  onDelete: (ahorro: Ahorro) => void;
}

export function AhorroCard({ ahorro, onContribute, onDelete }: AhorroCardProps) {
  const percentage =
    ahorro.objetivo > 0
      ? Math.min(100, Math.round((ahorro.actual / ahorro.objetivo) * 100))
      : 0;
  const isCompleted = ahorro.actual >= ahorro.objetivo;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="truncate font-medium text-foreground">{ahorro.nombre}</p>
        {isCompleted ? (
          <Badge tone="success">{ahorrosMessages.card.completed}</Badge>
        ) : (
          <button
            type="button"
            onClick={() => onContribute(ahorro)}
            aria-label={ahorrosMessages.card.contribute}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
      <ProgressBar value={percentage} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatCurrency(ahorro.actual)}
          </span>{' '}
          {ahorrosMessages.card.of(formatCurrency(ahorro.objetivo))}
        </p>
        <span className="text-sm font-medium text-foreground">{percentage}%</span>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(ahorro)}
          aria-label={ahorrosMessages.card.delete}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
