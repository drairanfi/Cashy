import type { ReactNode } from 'react';
import { formatCurrency } from '@/utils/format';

interface ItemCardProps {
  titulo: string;
  monto?: number;
  badge?: ReactNode;
  onDelete?: () => void;
}

export function ItemCard({ titulo, monto, badge, onDelete }: ItemCardProps) {
  return (
    <div className="item-card">
      <div className="item-card__info">
        <p className="item-card__titulo">{titulo}</p>
        {badge && <div className="item-card__meta">{badge}</div>}
      </div>
      <div className="item-card__actions">
        {monto !== undefined && <p className="item-card__monto">{formatCurrency(monto)}</p>}
        {onDelete && (
          <button
            type="button"
            className="item-card__delete"
            aria-label={`Eliminar ${titulo}`}
            onClick={onDelete}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}