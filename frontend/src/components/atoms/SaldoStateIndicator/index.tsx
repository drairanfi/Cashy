import { SALDO_STATE_LABELS, type SaldoState } from '../../../utils/saldo';

interface SaldoStateIndicatorProps {
  state: SaldoState;
}

export function SaldoStateIndicator({ state }: SaldoStateIndicatorProps) {
  return (
    <span className={`saldo-state-indicator saldo-state-indicator--${state}`}>
      <span className="saldo-state-indicator__dot" />
      {SALDO_STATE_LABELS[state]}
    </span>
  );
}
