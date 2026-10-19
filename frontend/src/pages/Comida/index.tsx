import { useState } from 'react';
import { useComidas, useCreateComida, useDeleteComida } from '@/hooks/useComidas';
import type { Comida } from '@/types';
import { formatCurrency } from '@/utils/format';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { AddCard } from '@/components/molecules/AddCard';
import { ItemCard } from '@/components/molecules/ItemCard';
import { Badge } from '@/components/atoms/Badge';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

export function Comida() {
  const { data: comidas = [] } = useComidas();
  const createComida = useCreateComida();
  const deleteComida = useDeleteComida();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Comida | null>(null);

  const total = comidas.reduce((acc, c) => acc + c.monto, 0);

  return (
    <DashboardLayout>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Comida' }]} />
      <PageHeader title="Comida" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list">
        <AddCard
          title="Agregar comida"
          hint="Registrá lo que gastaste en comida"
          onClick={() => setModalOpen(true)}
        />
        {comidas.length === 0 ? (
          <p className="section__empty">Todavía no cargaste comidas.</p>
        ) : (
          comidas.map((comida) => (
            <ItemCard
              key={comida.id}
              titulo={comida.descripcion}
              monto={comida.monto}
              badge={<Badge tone="warning">Alimentación</Badge>}
              onDelete={() => setToDelete(comida)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => createComida.mutate({ descripcion: data.descripcion, monto: data.monto })}
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