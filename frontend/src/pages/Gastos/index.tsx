import { useState } from 'react';
import { useCreateGasto, useDeleteGasto, useGastos } from '@/hooks/useGastos';
import type { Gasto } from '@/types';
import { formatCurrency } from '@/utils/format';
import { categoriaTone } from '@/utils/categoriaTone';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { AddCard } from '@/components/molecules/AddCard';
import { ItemCard } from '@/components/molecules/ItemCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ListSkeleton } from '@/components/molecules/ListSkeleton';
import { Badge } from '@/components/atoms/Badge';
import { WalletIcon } from '@/components/atoms/Icon';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

export function Gastos() {
  const { data: gastos = [], isLoading } = useGastos();
  const createGasto = useCreateGasto();
  const deleteGasto = useDeleteGasto();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Gasto | null>(null);

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Gastos' }]} />
      <PageHeader title="Gastos" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list" aria-busy={isLoading}>
        <AddCard
          title="Agregar nuevo gasto"
          hint="Registrá un gasto y elegí su categoría"
          onClick={() => setModalOpen(true)}
        />
        {isLoading ? (
          <ListSkeleton />
        ) : gastos.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={24} />}
            title="Todavía no cargaste gastos"
            text="Registrá tu primer gasto para ver cómo se reparte tu plata."
            actionLabel="Agregar gasto"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          gastos.map((gasto) => (
            <ItemCard
              key={gasto.id}
              titulo={gasto.descripcion}
              monto={gasto.monto}
              badge={<Badge tone={categoriaTone(gasto.categoria)}>{gasto.categoria}</Badge>}
              onDelete={() => setToDelete(gasto)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) =>
          createGasto.mutateAsync({
            descripcion: data.descripcion,
            monto: data.monto,
            categoria: data.categoria!,
          })
        }
        submitting={createGasto.isPending}
        title="Agregar gasto"
        conCategoria
        submitLabel="Guardar gasto"
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar gasto"
        message={`¿Eliminar "${toDelete?.descripcion}"?`}
        onConfirm={() => {
          if (toDelete) deleteGasto.mutate(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}
