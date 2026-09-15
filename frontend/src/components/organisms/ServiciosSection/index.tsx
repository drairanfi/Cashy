import type { Servicio } from '../../../types';
import { ServicioCard } from '../../molecules/ServicioCard';
import { Button } from '../../atoms/Button';

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
          <p className="section__empty">Todavía no cargaste servicios.</p>
        ) : (
          servicios.map((servicio) => (
            <ServicioCard key={servicio.id} servicio={servicio} onEdit={onEditar} />
          ))
        )}
      </div>
    </section>
  );
}
