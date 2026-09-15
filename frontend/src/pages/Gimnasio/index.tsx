import { useState } from 'react';
import { useMockDataStore } from '../../store/mockDataStore';
import type { GimnasioRegistro } from '../../types';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { ItemCard } from '../../components/molecules/ItemCard';
import { Badge } from '../../components/atoms/Badge';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ModalGasto } from '../../components/organisms/ModalGasto';

export function Gimnasio() {
  const gimnasio = useMockDataStore((s) => s.gimnasio);
  const addGimnasio = useMockDataStore((s) => s.addGimnasio);
  const removeGimnasio = useMockDataStore((s) => s.removeGimnasio);

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GimnasioRegistro | null>(null);

  const total = gimnasio.reduce((acc, r) => acc + r.monto, 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Gimnasio"
        subtitle={`Total: ${formatCurrency(total)}`}
        actionLabel="Agregar actividad"
        onAction={() => setModalOpen(true)}
      />

      <div className="section__list">
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
        onSave={(data) => addGimnasio({ actividad: data.descripcion, monto: data.monto })}
        title="Agregar actividad"
        labelDescripcion="Actividad"
        submitLabel="Guardar actividad"
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar actividad"
        message={`¿Eliminar "${toDelete?.actividad}"?`}
        onConfirm={() => {
          if (toDelete) removeGimnasio(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardLayout>
  );
}