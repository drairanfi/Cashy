import { CalendarDays } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import type { CuotaCalendario } from '@/types/deuda.types';
import { formatCurrency, formatDate } from '@/utils/format.util';

import { deudasMessages } from '../../messages';

interface DeudasCalendarProps {
  cuotas: CuotaCalendario[];
  isLoading: boolean;
}

interface CalendarGroup {
  key: string;
  label: string;
  items: CuotaCalendario[];
}

function groupByMonth(cuotas: CuotaCalendario[]): CalendarGroup[] {
  const groups = new Map<string, CalendarGroup>();

  for (const cuota of cuotas) {
    const date = new Date(cuota.fechaVencimiento);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label: date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
        items: []
      };
      groups.set(key, group);
    }

    group.items.push(cuota);
  }

  return Array.from(groups.values());
}

export function DeudasCalendar({ cuotas, isLoading }: DeudasCalendarProps) {
  if (isLoading) {
    return <ListSkeleton count={5} />;
  }

  if (cuotas.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-5" />}
        title={deudasMessages.calendar.emptyTitle}
        text={deudasMessages.calendar.emptyText}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groupByMonth(cuotas).map(group => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((cuota, index) => (
              <div
                key={`${group.key}-${cuota.deudaNombre}-${cuota.numero}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {cuota.deudaNombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deudasMessages.cuota.number(cuota.numero)} ·{' '}
                    {formatDate(cuota.fechaVencimiento)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {formatCurrency(cuota.monto)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
