import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
