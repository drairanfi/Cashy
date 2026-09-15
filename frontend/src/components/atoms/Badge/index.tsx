import type { ReactNode } from 'react';

type BadgeTone = 'danger' | 'warning' | 'success' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const TONES: Record<BadgeTone, string> = {
  danger: 'badge badge--danger',
  warning: 'badge badge--warning',
  success: 'badge badge--success',
  neutral: 'badge badge--neutral',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={TONES[tone]}>{children}</span>;
}
