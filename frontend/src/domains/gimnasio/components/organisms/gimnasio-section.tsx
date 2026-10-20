import { Dumbbell } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { GimnasioRegistro } from '@/types/gimnasio.types';
import { formatCurrency } from '@/utils/format.util';

import { GimnasioCard } from '../molecules/gimnasio-card';
import { gimnasioMessages } from '../../messages';

interface GimnasioSectionProps {
  registros: GimnasioRegistro[];
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (registro: GimnasioRegistro) => void;
}

export function GimnasioSection({
  registros,
  isLoading,
  onCreate,
  onDelete
}: GimnasioSectionProps) {
  const total = registros.reduce((acc, registro) => acc + registro.monto, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {gimnasioMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {gimnasioMessages.totalLabel(formatCurrency(total))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {gimnasioMessages.addAction}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : registros.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="size-5" />}
          title={gimnasioMessages.empty.title}
          text={gimnasioMessages.empty.text}
          actionLabel={gimnasioMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {registros.map(registro => (
            <GimnasioCard key={registro.id} registro={registro} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
