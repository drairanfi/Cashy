import { useState } from 'react';
import {
  useAhorros,
  useAportarAhorro,
  useCreateAhorro,
  useDeleteAhorro,
} from '../../hooks/useAhorros';
import type { Ahorro } from '../../types';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../../components/templates/DashboardLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { AhorroCard } from '../../components/molecules/AhorroCard';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ModalAhorro } from '../../components/organisms/ModalAhorro';
import { ModalAporte } from '../../components/organisms/ModalAporte';

export function Ahorros() {
  const { data: ahorros = [] } = useAhorros();
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
      <PageHeader
        title="Ahorros"
        subtitle={`${formatCurrency(totalAhorrado)} de ${formatCurrency(totalObjetivo)}`}
        actionLabel="Nueva meta"
        onAction={() => setModalOpen(true)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {ahorros.length === 0 ? (
          <p className="section__empty">Todavía no tenés metas de ahorro.</p>
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

      <ModalAhorro open={modalOpen} onClose={() => setModalOpen(false)} onSave={(data) => createAhorro.mutate(data)} />

      <ModalAporte
        open={toAportar !== null}
        nombre={toAportar?.nombre ?? ''}
        onClose={() => setToAportar(null)}
        onSave={(monto) => {
          if (toAportar) aportar.mutate({ id: toAportar.id, monto });
        }}
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