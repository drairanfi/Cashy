'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { DeudaModal } from '@/domains/deudas/components/organisms/deuda-modal';
import {
  DeudasSection,
  type DeudaView
} from '@/domains/deudas/components/organisms/deudas-section';
import { useCalendario } from '@/domains/deudas/hooks/use-calendario';
import { useDeuda } from '@/domains/deudas/hooks/use-deuda';
import { useDeudas } from '@/domains/deudas/hooks/use-deudas';
import { useDeleteDeuda } from '@/domains/deudas/hooks/use-delete-deuda';
import { usePagarCuota } from '@/domains/deudas/hooks/use-pagar-cuota';
import { deudasMessages } from '@/domains/deudas/messages';
import type { DeudaResumen } from '@/types/deuda.types';

export default function DebtsPage() {
  const [view, setView] = useState<DeudaView>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DeudaResumen | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: deudas = [], isLoading } = useDeudas();
  const { data: calendario = [], isLoading: isLoadingCalendar } = useCalendario();
  const { data: detail, isLoading: isDetailLoading } = useDeuda(expandedId);
  const deleteDeuda = useDeleteDeuda();
  const pagarCuota = usePagarCuota();

  const handleToggle = (id: string) => {
    setExpandedId(current => (current === id ? null : id));
  };

  const handleDelete = () => {
    if (toDelete) deleteDeuda.mutate(toDelete.id);
    setExpandedId(current => (current === toDelete?.id ? null : current));
    setToDelete(null);
  };

  const handlePagar = (id: string, numero: number) => {
    pagarCuota.mutate({ id, numero });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="deudas" />
      </div>
      <DeudasSection
        view={view}
        onViewChange={setView}
        deudas={deudas}
        isLoading={isLoading}
        calendario={calendario}
        isLoadingCalendar={isLoadingCalendar}
        expandedId={expandedId}
        detail={detail}
        isDetailLoading={isDetailLoading}
        isPaying={pagarCuota.isPending}
        onCreate={() => setIsModalOpen(true)}
        onToggle={handleToggle}
        onDelete={setToDelete}
        onPagar={handlePagar}
      />
      <DeudaModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={deudasMessages.confirmDelete.title}
        message={deudasMessages.confirmDelete.message(toDelete?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
