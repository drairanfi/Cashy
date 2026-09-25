import { useState } from 'react';
import { useCreateGasto, useDeleteGasto, useGastos } from '../../hooks/useGastos';
import type { Gasto, GastoCategoria } from '../../types';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { ItemCard } from '../../components/molecules/ItemCard';
import { Badge } from '../../components/atoms/Badge';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ModalGasto } from '../../components/organisms/ModalGasto';

const CATEGORY_TONE: Record<GastoCategoria, 'neutral' | 'warning' | 'success' | 'danger'> = {
  Hogar: 'neutral',
  Transporte: 'warning',
  Ocio: 'success',
  Salud: 'danger',
  Otros: 'neutral',
};

export function Gastos() {
  const { data: gastos = [] } = useGastos();
  const createGasto = useCreateGasto();
  const deleteGasto = useDeleteGasto();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Gasto | null>(null);

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Gastos"
        subtitle={`Total: ${formatCurrency(total)}`}
        actionLabel="Agregar gasto"
        onAction={() => setModalOpen(true)}
      />

      <div className="section__list">
        {gastos.length === 0 ? (
          <p className="section__empty">Todavía no cargaste gastos.</p>
        ) : (
          gastos.map((gasto) => (
            <ItemCard
              key={gasto.id}
              titulo={gasto.descripcion}
              monto={gasto.monto}
              badge={<Badge tone={CATEGORY_TONE[gasto.categoria]}>{gasto.categoria}</Badge>}
              onDelete={() => setToDelete(gasto)}
            />
          ))
        )}
      </div>

      <ModalGasto
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) =>
          createGasto.mutate({
            descripcion: data.descripcion,
            monto: data.monto,
            categoria: data.categoria!,
          })
        }
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