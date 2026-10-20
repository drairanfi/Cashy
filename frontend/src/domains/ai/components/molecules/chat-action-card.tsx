'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AiAction } from '@/types/ai.types';

import { aiMessages } from '../../messages';

export type ChatActionStatus = 'pending' | 'executing' | 'done' | 'cancelled';

const STATUS_CLASSES: Record<ChatActionStatus, string> = {
  pending: '',
  executing: 'text-muted-foreground',
  done: 'text-emerald-600',
  cancelled: 'text-muted-foreground'
};

const STATUS_LABELS: Record<ChatActionStatus, string> = {
  pending: '',
  executing: aiMessages.chat.executing,
  done: aiMessages.chat.done,
  cancelled: aiMessages.chat.cancelled
};

function summarizeArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return '';
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
}

interface ChatActionCardProps {
  action: AiAction;
  status: ChatActionStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChatActionCard({ action, status, onConfirm, onCancel }: ChatActionCardProps) {
  const argsSummary = summarizeArgs(action.args);

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {aiMessages.chat.proposalsTitle}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{action.resumen}</p>
      {argsSummary && (
        <p className="mt-1 text-xs text-muted-foreground">{argsSummary}</p>
      )}

      {status === 'pending' ? (
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {aiMessages.chat.cancel}
          </Button>
          <Button size="sm" onClick={onConfirm}>
            {aiMessages.chat.confirm}
          </Button>
        </div>
      ) : (
        <p className={cn('mt-2 text-xs', STATUS_CLASSES[status])}>{STATUS_LABELS[status]}</p>
      )}
    </div>
  );
}
