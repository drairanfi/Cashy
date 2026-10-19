import type { Servicio } from '@/types';
import { ServicioCard } from '@/components/molecules/ServicioCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Button } from '@/components/atoms/Button';
import { ReceiptIcon } from '@/components/atoms/Icon';

interface ServiciosSectionProps {
  servicios: Servicio[];
  onCrear: () => void;
  onEditar: (servicio: Servicio) => void;
}

export function ServiciosSection({ servicios, onCrear, onEditar }: ServiciosSectionProps) {
  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">Servicios</h2>
        <Button variant="ghost" onClick={onCrear}>
          Agregar servicio
        </Button>
      </div>
      <div className="section__list">
        {servicios.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon size={24} />}
            title="Todavía no cargaste servicios"
            text="Sumá tus servicios fijos para calcular tu saldo disponible."
            actionLabel="Agregar servicio"
            onAction={onCrear}
          />
        ) : (
          servicios.map((servicio) => (
            <ServicioCard key={servicio.id} servicio={servicio} onEdit={onEditar} />
          ))
        )}
      </div>
    </section>
  );
}
