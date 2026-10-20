import { Receipt } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { Button } from '@/components/ui/button';
import type { Servicio } from '@/types/servicio.types';

import { ServicioCard } from '../molecules/servicio-card';
import { serviciosMessages } from '../../messages';

interface ServiciosSectionProps {
  servicios: Servicio[];
  onCreate: () => void;
  onEdit: (servicio: Servicio) => void;
}

export function ServiciosSection({ servicios, onCreate, onEdit }: ServiciosSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {serviciosMessages.sectionTitle}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCreate}>
          {serviciosMessages.addAction}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {servicios.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-5" />}
            title={serviciosMessages.empty.title}
            text={serviciosMessages.empty.text}
            actionLabel={serviciosMessages.empty.action}
            onAction={onCreate}
          />
        ) : (
          servicios.map(servicio => (
            <ServicioCard key={servicio.id} servicio={servicio} onEdit={onEdit} />
          ))
        )}
      </div>
    </section>
  );
}
