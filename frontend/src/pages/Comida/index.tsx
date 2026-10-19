import { useState } from 'react';
import { useComidas, useCreateComida, useDeleteComida } from '@/hooks/useComidas';
import type { Comida } from '@/types';
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
import { UtensilsIcon } from '@/components/atoms/Icon';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

export function Comida() {
  const { data: comidas = [], isLoading } = useComidas();
  const createComida = useCreateComida();
  const deleteComida = useDeleteComida();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Comida | null>(null);

  const total = comidas.reduce((acc, c) => acc + c.monto, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Comida' }]} />
      <PageHeader title="Comida" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list" aria-busy={isLoading}>
        <AddCard
          title="Agregar comida"
          hint="Registrá lo que gastaste en comida"
          onClick={() => setModalOpen(true)}
        />
        {isLoading ? (
          <ListSkeleton />
        ) : comidas.length === 0 ? (
          <EmptyState
            icon={<UtensilsIcon size={24} />}
            title="Todavía no cargaste comidas"
            text="Anotá tus gastos de comida para tener el total del mes a mano."
            actionLabel="Agregar comida"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          comidas.map((comida) => (
            <ItemCard
              key={comida.id}
              titulo={comida.descripcion}
              monto={comida.monto}
              badge={<Badge tone={categoriaTone('Alimentación')}>Alimentación</Badge>}
              onDelete={() => setToDelete(comida)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) =>
          createComida.mutateAsync({ descripcion: data.descripcion, monto: data.monto })
        }
        submitting={createComida.isPending}
        title="Agregar comida"
        labelDescripcion="Comida"
        submitLabel="Guardar comida"
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar comida"
        message={`¿Eliminar "${toDelete?.descripcion}"?`}
        onConfirm={() => {
          if (toDelete) deleteComida.mutate(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}
