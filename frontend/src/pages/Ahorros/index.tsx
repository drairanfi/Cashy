import { useState } from 'react';
import {
  useAhorros,
  useAportarAhorro,
  useCreateAhorro,
  useDeleteAhorro,
} from '@/hooks/useAhorros';
import type { Ahorro } from '@/types';
import { formatCurrency } from '@/utils/format';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { AhorroCard } from '@/components/molecules/AhorroCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ListSkeleton } from '@/components/molecules/ListSkeleton';
import { PiggyIcon } from '@/components/atoms/Icon';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalAhorro } from '@/components/organisms/ModalAhorro';
import { ModalAporte } from '@/components/organisms/ModalAporte';

export function Ahorros() {
  const { data: ahorros = [], isLoading } = useAhorros();
  const createAhorro = useCreateAhorro();
  const aportar = useAportarAhorro();
  const deleteAhorro = useDeleteAhorro();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Ahorro | null>(null);
  const [toAportar, setToAportar] = useState<Ahorro | null>(null);

  const totalAhorrado = ahorros.reduce((acc, a) => acc + a.actual, 0);
  const totalObjetivo = ahorros.reduce((acc, a) => acc + a.objetivo, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Ahorros' }]} />
      <PageHeader
        title="Ahorros"
        subtitle={`${formatCurrency(totalAhorrado)} de ${formatCurrency(totalObjetivo)}`}
        actionLabel="Nueva meta"
        onAction={() => setModalOpen(true)}
      />

      <div className="grid gap-3 md:grid-cols-2" aria-busy={isLoading}>
        {isLoading ? (
          <ListSkeleton className="contents" count={2} />
        ) : ahorros.length === 0 ? (
          <EmptyState
            icon={<PiggyIcon size={24} />}
            title="Todavía no tenés metas de ahorro"
            text="Creá una meta y empezá a guardar para lo que más querés."
            actionLabel="Crear meta"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          ahorros.map((ahorro) => (
            <AhorroCard
              key={ahorro.id}
              ahorro={ahorro}
              onAportar={setToAportar}
              onDelete={setToDelete}
            />
          ))
        )}
      </div>

      <ModalAhorro
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => createAhorro.mutateAsync(data)}
        submitting={createAhorro.isPending}
      />

      <ModalAporte
        open={toAportar !== null}
        nombre={toAportar?.nombre ?? ''}
        onClose={() => setToAportar(null)}
        onSave={(monto) => {
          if (!toAportar) return Promise.resolve();
          return aportar.mutateAsync({ id: toAportar.id, monto });
        }}
        submitting={aportar.isPending}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar meta"
        message={`¿Eliminar "${toDelete?.nombre}"?`}
        onConfirm={() => {
          if (toDelete) deleteAhorro.mutate(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}
