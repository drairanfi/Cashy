export type IndicatorTone = 'danger' | 'warning' | 'success';

interface ColorIndicatorProps {
  tone: IndicatorTone;
}

export function ColorIndicator({ tone }: ColorIndicatorProps) {
  return <span className={`color-indicator color-indicator--${tone}`} aria-hidden />;
}
