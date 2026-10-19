import { useState } from 'react';
import { useCreateGasto, useDeleteGasto, useGastos } from '@/hooks/useGastos';
import type { Gasto } from '@/types';
import { formatCurrency } from '@/utils/format';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { AddCard } from '@/components/molecules/AddCard';
import { ItemCard } from '@/components/molecules/ItemCard';
import { Badge } from '@/components/atoms/Badge';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ModalGasto } from '@/components/organisms/ModalGasto';

const CATEGORY_TONE: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
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
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Gastos' }]} />
      <PageHeader title="Gastos" subtitle={`Total: ${formatCurrency(total)}`} />

      <div className="section__list">
        <AddCard
          title="Agregar nuevo gasto"
          hint="Registrá un gasto y elegí su categoría"
          onClick={() => setModalOpen(true)}
        />
        {gastos.length === 0 ? (
          <p className="section__empty">Todavía no cargaste gastos.</p>
        ) : (
          gastos.map((gasto) => (
            <ItemCard
              key={gasto.id}
              titulo={gasto.descripcion}
              monto={gasto.monto}
              badge={<Badge tone={CATEGORY_TONE[gasto.categoria] ?? 'neutral'}>{gasto.categoria}</Badge>}
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