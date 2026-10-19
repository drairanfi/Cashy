import { useState } from 'react';
import { useGimnasio, useCreateGimnasio, useDeleteGimnasio } from '@/hooks/useGimnasio';
import type { GimnasioRegistro } from '@/types';
import { formatCurrency } from '@/utils/format';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { AddCard } from '@/components/molecules/AddCard';
import { ItemCard } from '@/components/molecules/ItemCard';
import { Badge } from '@/components/atoms/Badge';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

export function Gimnasio() {
  const { data: gimnasio = [] } = useGimnasio();
  const createGimnasio = useCreateGimnasio();
  const deleteGimnasio = useDeleteGimnasio();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GimnasioRegistro | null>(null);

  const total = gimnasio.reduce((acc, r) => acc + r.monto, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Gimnasio' }]} />
      <PageHeader title="Gimnasio" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list">
        <AddCard
          title="Agregar actividad"
          hint="Registrá tu entrenamiento o actividad"
          onClick={() => setModalOpen(true)}
        />
        {gimnasio.length === 0 ? (
          <p className="section__empty">Todavía no cargaste actividades.</p>
        ) : (
          gimnasio.map((registro) => (
            <ItemCard
              key={registro.id}
              titulo={registro.actividad}
              monto={registro.monto}
              badge={<Badge tone="success">Entrenamiento</Badge>}
              onDelete={() => setToDelete(registro)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) =>
          createGimnasio.mutate({ actividad: data.descripcion, monto: data.monto })
        }
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