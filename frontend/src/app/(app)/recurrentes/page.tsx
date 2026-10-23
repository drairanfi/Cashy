'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { RecurrenteModal } from '@/domains/recurrentes/components/organisms/recurrente-modal';
import { RecurrentesSection } from '@/domains/recurrentes/components/organisms/recurrentes-section';
import { useConfirmarOcurrencia } from '@/domains/recurrentes/hooks/use-confirmar-ocurrencia';
import { useDeleteRecurrente } from '@/domains/recurrentes/hooks/use-delete-recurrente';
import { useOmitirOcurrencia } from '@/domains/recurrentes/hooks/use-omitir-ocurrencia';
import { usePendientes } from '@/domains/recurrentes/hooks/use-pendientes';
import { useRecurrentes } from '@/domains/recurrentes/hooks/use-recurrentes';
import { useUpdateRecurrente } from '@/domains/recurrentes/hooks/use-update-recurrente';
import { recurrentesMessages } from '@/domains/recurrentes/messages';
import type {
  Recurrente,
  RecurrenteOcurrencia
} from '@/domains/recurrentes/types/recurrente.types';

export default function RecurrentesPage() {
  const { data: recurrentes = [], isLoading } = useRecurrentes();
  const { data: pendientes = [], isLoading: isLoadingPendientes } = usePendientes();
  const updateRecurrente = useUpdateRecurrente();
  const deleteRecurrente = useDeleteRecurrente();
  const confirmarOcurrencia = useConfirmarOcurrencia();
  const omitirOcurrencia = useOmitirOcurrencia();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Recurrente | null>(null);

  const handleToggleEstado = (recurrente: Recurrente) => {
    updateRecurrente.mutate({
      id: recurrente.id,
      estado: recurrente.estado === 'activa' ? 'pausada' : 'activa'
    });
  };

  const handleDelete = () => {
    if (toDelete) deleteRecurrente.mutate(toDelete.id);
    setToDelete(null);
  };

  const handleConfirmar = (ocurrencia: RecurrenteOcurrencia) => {
    confirmarOcurrencia.mutate(ocurrencia.id);
  };

  const handleOmitir = (ocurrencia: RecurrenteOcurrencia) => {
    omitirOcurrencia.mutate(ocurrencia.id);
  };

  const isProcessing = confirmarOcurrencia.isPending || omitirOcurrencia.isPending;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="recurrentes" />
      </div>
      <RecurrentesSection
        recurrentes={recurrentes}
        isLoading={isLoading}
        pendientes={pendientes}
        isLoadingPendientes={isLoadingPendientes}
        isProcessing={isProcessing}
        onCreate={() => setIsModalOpen(true)}
        onToggleEstado={handleToggleEstado}
        onDelete={setToDelete}
        onConfirmar={handleConfirmar}
        onOmitir={handleOmitir}
      />
      <RecurrenteModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={recurrentesMessages.confirmDelete.title}
        message={recurrentesMessages.confirmDelete.message(toDelete?.concepto ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
