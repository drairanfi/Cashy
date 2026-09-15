import type { Meta } from '../../../types';
import { MetaCard } from '../../molecules/MetaCard';
import { Button } from '../../atoms/Button';

interface MetasSectionProps {
  metas: Meta[];
  onCrear: () => void;
  onEditar: (meta: Meta) => void;
}

export function MetasSection({ metas, onCrear, onEditar }: MetasSectionProps) {
  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">Metas de ahorro</h2>
        <Button variant="ghost" onClick={onCrear}>
          Agregar meta
        </Button>
      </div>
      <div className="section__list">
        {metas.length === 0 ? (
          <p className="section__empty">Todavía no tenés metas.</p>
        ) : (
          metas.map((meta) => <MetaCard key={meta.id} meta={meta} onEdit={onEditar} />)
        )}
      </div>
    </section>
  );
}
