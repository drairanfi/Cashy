import { Landmark } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format.util';

import { cuentasMessages } from '../../messages';
import type { Cuenta } from '../../types/cuenta.types';
import { CuentaCard } from '../molecules/cuenta-card';

interface CuentasSectionProps {
  cuentas: Cuenta[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (cuenta: Cuenta) => void;
  onDelete: (cuenta: Cuenta) => void;
}

export function CuentasSection({
  cuentas,
  isLoading,
  onCreate,
  onEdit,
  onDelete
}: CuentasSectionProps) {
  const totalBalance = cuentas.reduce((acc, cuenta) => acc + cuenta.balance, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {cuentasMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {cuentasMessages.totalLabel(formatCurrency(totalBalance))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {cuentasMessages.addAction}
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : cuentas.length === 0 ? (
        <EmptyState
          icon={<Landmark className="size-5" />}
          title={cuentasMessages.empty.title}
          text={cuentasMessages.empty.text}
          actionLabel={cuentasMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cuentas.map(cuenta => (
            <CuentaCard
              key={cuenta.id}
              cuenta={cuenta}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
