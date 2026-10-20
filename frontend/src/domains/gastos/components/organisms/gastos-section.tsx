import { Wallet } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import type { Gasto } from '@/types/gasto.types';
import { formatCurrency } from '@/utils/format.util';

import { GastoCard } from '../molecules/gasto-card';
import { gastosMessages } from '../../messages';

interface GastosSectionProps {
  gastos: Gasto[];
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (gasto: Gasto) => void;
}

export function GastosSection({ gastos, isLoading, onCreate, onDelete }: GastosSectionProps) {
  const total = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {gastosMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {gastosMessages.totalLabel(formatCurrency(total))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {gastosMessages.addAction}
        </Button>
      </div>
      {isLoading ? (
        <ListSkeleton count={4} />
      ) : gastos.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" />}
          title={gastosMessages.empty.title}
          text={gastosMessages.empty.text}
          actionLabel={gastosMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {gastos.map(gasto => (
            <GastoCard key={gasto.id} gasto={gasto} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
