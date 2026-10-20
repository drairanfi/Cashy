import { HandCoins } from 'lucide-react';

import { Skeleton } from '@/components/atoms/skeleton';
import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CuotaCalendario, DeudaDetalle, DeudaResumen } from '@/types/deuda.types';
import { formatCurrency } from '@/utils/format.util';

import { CuotaList } from '../molecules/cuota-list';
import { DeudaCard } from '../molecules/deuda-card';
import { DeudasCalendar } from './deudas-calendar';
import { deudasMessages } from '../../messages';

export type DeudaView = 'list' | 'calendar';

const VIEW_OPTIONS: { value: DeudaView; label: string }[] = [
  { value: 'list', label: deudasMessages.viewList },
  { value: 'calendar', label: deudasMessages.viewCalendar }
];

interface DeudasSectionProps {
  view: DeudaView;
  onViewChange: (view: DeudaView) => void;
  deudas: DeudaResumen[];
  isLoading: boolean;
  calendario: CuotaCalendario[];
  isLoadingCalendar: boolean;
  expandedId: string | null;
  detail: DeudaDetalle | undefined;
  isDetailLoading: boolean;
  isPaying: boolean;
  onCreate: () => void;
  onToggle: (id: string) => void;
  onDelete: (deuda: DeudaResumen) => void;
  onPagar: (id: string, numero: number) => void;
}

export function DeudasSection({
  view,
  onViewChange,
  deudas,
  isLoading,
  calendario,
  isLoadingCalendar,
  expandedId,
  detail,
  isDetailLoading,
  isPaying,
  onCreate,
  onToggle,
  onDelete,
  onPagar
}: DeudasSectionProps) {
  const totalPending = deudas.reduce((acc, deuda) => acc + deuda.montoPendiente, 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {deudasMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {deudasMessages.totalPendingLabel(formatCurrency(totalPending))}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {deudasMessages.addAction}
        </Button>
      </div>

      <div className="flex w-fit gap-1 rounded-full bg-muted p-1" role="tablist">
        {VIEW_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={view === option.value}
            onClick={() => onViewChange(option.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              view === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {view === 'calendar' ? (
        <DeudasCalendar cuotas={calendario} isLoading={isLoadingCalendar} />
      ) : isLoading ? (
        <ListSkeleton count={4} />
      ) : deudas.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="size-5" />}
          title={deudasMessages.empty.title}
          text={deudasMessages.empty.text}
          actionLabel={deudasMessages.empty.action}
          onAction={onCreate}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {deudas.map(deuda => (
            <div key={deuda.id} className="flex flex-col gap-2">
              <DeudaCard
                deuda={deuda}
                isExpanded={expandedId === deuda.id}
                onToggle={onToggle}
                onDelete={onDelete}
              />
              {expandedId === deuda.id &&
                (isDetailLoading ? (
                  <div className="ml-3 flex flex-col gap-2 pl-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  detail && (
                    <CuotaList
                      cuotas={detail.cuotas}
                      isPaying={isPaying}
                      onPagar={numero => onPagar(deuda.id, numero)}
                    />
                  )
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
