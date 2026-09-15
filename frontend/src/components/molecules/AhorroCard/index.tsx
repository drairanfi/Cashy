import type { Ahorro } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { Badge } from '../../atoms/Badge';

interface AhorroCardProps {
  ahorro: Ahorro;
  onAportar: (ahorro: Ahorro) => void;
  onDelete: (ahorro: Ahorro) => void;
}

export function AhorroCard({ ahorro, onAportar, onDelete }: AhorroCardProps) {
  const pct = Math.min(100, Math.round((ahorro.actual / ahorro.objetivo) * 100));
  const completado = ahorro.actual >= ahorro.objetivo;

  return (
    <div className="ahorro-card">
      <div className="ahorro-card__header">
        <p className="ahorro-card__nombre">{ahorro.nombre}</p>
        {completado ? (
          <Badge tone="success">Completada</Badge>
        ) : (
          <button type="button" className="item-card__edit" onClick={() => onAportar(ahorro)} aria-label="Aportar">
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
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ahorro-card__montos">
        <p className="ahorro-card__actual">{formatCurrency(ahorro.actual)}</p>
        <p className="ahorro-card__objetivo">de {formatCurrency(ahorro.objetivo)}</p>
      </div>
      <div className="ahorro-card__footer">
        <p className="ahorro-card__pct">{pct}%</p>
        <button
          type="button"
          className="item-card__delete"
          onClick={() => onDelete(ahorro)}
          aria-label="Eliminar meta"
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
      </div>
    </div>
  );
}