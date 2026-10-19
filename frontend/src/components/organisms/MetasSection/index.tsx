import type { Meta } from '@/types';
import { MetaCard } from '@/components/molecules/MetaCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Button } from '@/components/atoms/Button';
import { TargetIcon } from '@/components/atoms/Icon';

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
          <EmptyState
            icon={<TargetIcon size={24} />}
            title="Todavía no tenés metas"
            text="Definí tus metas de ahorro y seguí cuánto te falta."
            actionLabel="Agregar meta"
            onAction={onCrear}
          />
        ) : (
          metas.map((meta) => <MetaCard key={meta.id} meta={meta} onEdit={onEditar} />)
        )}
      </div>
    </section>
  );
}
