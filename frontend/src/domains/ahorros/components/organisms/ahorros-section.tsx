import { PiggyBank } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { Ahorro } from '@/types/ahorro.types';
import { formatCurrency } from '@/utils/format.util';

import { AhorroCard } from '../molecules/ahorro-card';
import { ahorrosMessages } from '../../messages';

interface AhorrosSectionProps {
  ahorros: Ahorro[];
  isLoading: boolean;
  onCreate: () => void;
  onContribute: (ahorro: Ahorro) => void;
  onDelete: (ahorro: Ahorro) => void;
}

export function AhorrosSection({
  ahorros,
  isLoading,
  onCreate,
  onContribute,
  onDelete
}: AhorrosSectionProps) {
  const totalSaved = ahorros.reduce((acc, ahorro) => acc + ahorro.actual, 0);
  const totalTarget = ahorros.reduce((acc, ahorro) => acc + ahorro.objetivo, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {ahorrosMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ahorrosMessages.totalLabel(
              formatCurrency(totalSaved),
              formatCurrency(totalTarget)
            )}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {ahorrosMessages.addAction}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={2} />
      ) : ahorros.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="size-5" />}
          title={ahorrosMessages.empty.title}
          text={ahorrosMessages.empty.text}
          actionLabel={ahorrosMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {ahorros.map(ahorro => (
            <AhorroCard
              key={ahorro.id}
              ahorro={ahorro}
              onContribute={onContribute}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
