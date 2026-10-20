import { Badge, type BadgeTone } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import type { Insight, InsightTipo } from '@/types/ai.types';

import { aiMessages } from '../../messages';

const TONE_BY_TIPO: Record<InsightTipo, BadgeTone> = {
  alerta: 'danger',
  sugerencia: 'warning',
  info: 'neutral'
};

const CARD_CLASSES: Record<InsightTipo, string> = {
  alerta: 'border-rose-200 bg-rose-50',
  sugerencia: 'border-amber-200 bg-amber-50',
  info: 'border-border bg-card'
};

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className={cn('rounded-2xl border p-4', CARD_CLASSES[insight.tipo])}>
      <Badge tone={TONE_BY_TIPO[insight.tipo]}>{aiMessages.insights.tones[insight.tipo]}</Badge>
      <p className="mt-2 text-sm font-semibold text-foreground">{insight.titulo}</p>
      <p className="mt-1 text-sm text-muted-foreground">{insight.mensaje}</p>
    </div>
  );
}
