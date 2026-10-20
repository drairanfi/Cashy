import { UtensilsCrossed } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { Comida } from '@/types/comida.types';
import { formatCurrency } from '@/utils/format.util';

import { ComidaCard } from '../molecules/comida-card';
import { comidasMessages } from '../../messages';

interface ComidasSectionProps {
  comidas: Comida[];
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (comida: Comida) => void;
}

export function ComidasSection({ comidas, isLoading, onCreate, onDelete }: ComidasSectionProps) {
  const total = comidas.reduce((acc, comida) => acc + comida.monto, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {comidasMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {comidasMessages.totalLabel(formatCurrency(total))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {comidasMessages.addAction}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : comidas.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="size-5" />}
          title={comidasMessages.empty.title}
          text={comidasMessages.empty.text}
          actionLabel={comidasMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {comidas.map(comida => (
            <ComidaCard key={comida.id} comida={comida} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
