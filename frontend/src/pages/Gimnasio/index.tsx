import { useState } from 'react';
import { useGimnasio, useCreateGimnasio, useDeleteGimnasio } from '@/hooks/useGimnasio';
import type { GimnasioRegistro } from '@/types';
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
import { DumbbellIcon } from '@/components/atoms/Icon';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

export function Gimnasio() {
  const { data: gimnasio = [], isLoading } = useGimnasio();
  const createGimnasio = useCreateGimnasio();
  const deleteGimnasio = useDeleteGimnasio();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GimnasioRegistro | null>(null);

  const total = gimnasio.reduce((acc, r) => acc + r.monto, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Gimnasio' }]} />
      <PageHeader title="Gimnasio" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list" aria-busy={isLoading}>
        <AddCard
          title="Agregar actividad"
          hint="Registrá tu entrenamiento o actividad"
          onClick={() => setModalOpen(true)}
        />
        {isLoading ? (
          <ListSkeleton />
        ) : gimnasio.length === 0 ? (
          <EmptyState
            icon={<DumbbellIcon size={24} />}
            title="Todavía no cargaste actividades"
            text="Sumá tus entrenamientos y lo que gastás en el gym."
            actionLabel="Agregar actividad"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          gimnasio.map((registro) => (
            <ItemCard
              key={registro.id}
              titulo={registro.actividad}
              monto={registro.monto}
              badge={<Badge tone={categoriaTone('Entrenamiento')}>Entrenamiento</Badge>}
              onDelete={() => setToDelete(registro)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) =>
          createGimnasio.mutateAsync({ actividad: data.descripcion, monto: data.monto })
        }
        submitting={createGimnasio.isPending}
        title="Agregar actividad"
        labelDescripcion="Actividad"
        submitLabel="Guardar actividad"
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar actividad"
        message={`¿Eliminar "${toDelete?.actividad}"?`}
        onConfirm={() => {
          if (toDelete) deleteGimnasio.mutate(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}
