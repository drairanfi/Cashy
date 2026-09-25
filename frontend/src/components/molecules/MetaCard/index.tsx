import type { Meta } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface MetaCardProps {
  meta: Meta;
  onEdit: (meta: Meta) => void;
}

export function MetaCard({ meta, onEdit }: MetaCardProps) {
  return (
    <div className={`meta-card ${meta.prioritaria ? 'meta-card--prioritaria' : ''}`}>
      <div className="meta-card__header">
        <div className="meta-card__titulo-wrap">
          <p className="meta-card__titulo">{meta.nombre}</p>
          {meta.prioritaria && <span className="meta-card__badge">Meta grande</span>}
        </div>
        <button type="button" className="meta-card__action" onClick={() => onEdit(meta)}>
          Editar
        </button>
      </div>
      <p className="meta-card__objetivo">{formatCurrency(meta.montoObjetivo)}</p>
      <p className="meta-card__mensual">{formatCurrency(meta.montoMensual)}/mes</p>
      {meta.mesesParaAlcanzar !== null && (
        <p className="meta-card__meses">{meta.mesesParaAlcanzar} meses para alcanzarla</p>
      )}
    </div>
  );
}
