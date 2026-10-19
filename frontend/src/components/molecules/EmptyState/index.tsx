import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">{icon}</span>
      <div className="empty-state__body">
        <p className="empty-state__title">{title}</p>
        {text && <p className="empty-state__text">{text}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
