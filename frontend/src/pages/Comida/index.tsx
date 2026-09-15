import { useState } from 'react';
import { useMockDataStore } from '../../store/mockDataStore';
import type { Comida } from '../../types';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { ItemCard } from '../../components/molecules/ItemCard';
import { Badge } from '../../components/atoms/Badge';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ModalGasto } from '../../components/organisms/ModalGasto';

export function Comida() {
  const comidas = useMockDataStore((s) => s.comidas);
  const addComida = useMockDataStore((s) => s.addComida);
  const removeComida = useMockDataStore((s) => s.removeComida);

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Comida | null>(null);

  const total = comidas.reduce((acc, c) => acc + c.monto, 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Comida"
        subtitle={`Total: ${formatCurrency(total)}`}
        actionLabel="Agregar comida"
        onAction={() => setModalOpen(true)}
      />

      <div className="section__list">
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
        onSave={(data) => addComida({ descripcion: data.descripcion, monto: data.monto })}
        title="Agregar comida"
        labelDescripcion="Comida"
        submitLabel="Guardar comida"
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar comida"
        message={`¿Eliminar "${toDelete?.descripcion}"?`}
        onConfirm={() => {
          if (toDelete) removeComida(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}