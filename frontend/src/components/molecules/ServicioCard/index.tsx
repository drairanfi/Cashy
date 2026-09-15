import type { Servicio } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface ServicioCardProps {
  servicio: Servicio;
  onEdit: (servicio: Servicio) => void;
}

export function ServicioCard({ servicio, onEdit }: ServicioCardProps) {
  return (
    <div className="servicio-card">
      <div>
        <p className="servicio-card__titulo">{servicio.nombre}</p>
        <p className="servicio-card__monto">{formatCurrency(servicio.montoDestinado)}</p>
      </div>
      <button type="button" className="servicio-card__action" onClick={() => onEdit(servicio)}>
        Editar
      </button>
    </div>
  );
}
