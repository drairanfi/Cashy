import { CalendarClock, Repeat } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { Button } from '@/components/ui/button';

import { recurrentesMessages } from '../../messages';
import type { Recurrente, RecurrenteOcurrencia } from '../../types/recurrente.types';
import { PendienteItem } from '../molecules/pendiente-item';
import { RecurrenteCard } from '../molecules/recurrente-card';

interface RecurrentesSectionProps {
  recurrentes: Recurrente[];
  isLoading: boolean;
  pendientes: RecurrenteOcurrencia[];
  isLoadingPendientes: boolean;
  isProcessing: boolean;
  onCreate: () => void;
  onToggleEstado: (recurrente: Recurrente) => void;
  onDelete: (recurrente: Recurrente) => void;
  onConfirmar: (ocurrencia: RecurrenteOcurrencia) => void;
  onOmitir: (ocurrencia: RecurrenteOcurrencia) => void;
}

export function RecurrentesSection({
  recurrentes,
  isLoading,
  pendientes,
  isLoadingPendientes,
  isProcessing,
  onCreate,
  onToggleEstado,
  onDelete,
  onConfirmar,
  onOmitir
}: RecurrentesSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {recurrentesMessages.sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {recurrentesMessages.subtitle}
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          {recurrentesMessages.addAction}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {recurrentesMessages.listTitle}
        </h2>
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : recurrentes.length === 0 ? (
          <EmptyState
            icon={<Repeat className="size-5" />}
            title={recurrentesMessages.empty.title}
            text={recurrentesMessages.empty.text}
            actionLabel={recurrentesMessages.empty.action}
            onAction={onCreate}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recurrentes.map(recurrente => (
              <RecurrenteCard
                key={recurrente.id}
                recurrente={recurrente}
                onToggleEstado={onToggleEstado}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {recurrentesMessages.pendientes.title}
        </h2>
        {isLoadingPendientes ? (
          <ListSkeleton count={2} />
        ) : pendientes.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="size-5" />}
            title={recurrentesMessages.pendientes.emptyTitle}
            text={recurrentesMessages.pendientes.emptyText}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {pendientes.map(ocurrencia => (
              <PendienteItem
                key={ocurrencia.id}
                ocurrencia={ocurrencia}
                isPending={isProcessing}
                onConfirmar={onConfirmar}
                onOmitir={onOmitir}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
