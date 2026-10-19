import { Link } from 'react-router-dom';
import { Badge, type BadgeTone } from '@/components/atoms/Badge';
import { ItemCard } from '@/components/molecules/ItemCard';
import { categoriaTone } from '@/utils/categoriaTone';
import { formatDate } from '@/utils/format';
import type { MovimientoTipo } from '@/types';

interface MovimientoRowProps {
  to: string;
  tipo: MovimientoTipo;
  titulo: string;
  monto: number;
  fecha: string;
  categoria?: string;
}

const TIPO_LABEL: Record<MovimientoTipo, string> = {
  gasto: 'Gasto',
  comida: 'Comida',
  gimnasio: 'Gimnasio',
};

const TIPO_TONE: Record<MovimientoTipo, BadgeTone> = {
  gasto: 'danger',
  comida: 'warning',
  gimnasio: 'success',
};

export function MovimientoRow({ to, tipo, titulo, monto, fecha, categoria }: MovimientoRowProps) {
  return (
    <Link to={to} className="movimiento-row">
      <ItemCard
        titulo={titulo}
        monto={monto}
        badge={
          <>
            <Badge tone={TIPO_TONE[tipo]}>{TIPO_LABEL[tipo]}</Badge>
            {categoria && <Badge tone={categoriaTone(categoria)}>{categoria}</Badge>}
            <span className="movimiento-row__fecha">{formatDate(fecha)}</span>
          </>
        }
      />
    </Link>
  );
}
