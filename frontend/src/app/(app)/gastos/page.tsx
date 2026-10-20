'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { GastoModal } from '@/domains/gastos/components/organisms/gasto-modal';
import { GastosSection } from '@/domains/gastos/components/organisms/gastos-section';
import { useDeleteGasto, useGastos } from '@/domains/gastos/hooks/use-gastos';
import { gastosMessages } from '@/domains/gastos/messages';
import type { Gasto } from '@/types/gasto.types';

export default function ExpensesPage() {
  const { data: gastos = [], isLoading } = useGastos();
  const deleteGasto = useDeleteGasto();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Gasto | null>(null);

  const handleDelete = () => {
    if (toDelete) deleteGasto.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <GastosSection
        gastos={gastos}
        isLoading={isLoading}
        onCreate={() => setIsModalOpen(true)}
        onDelete={setToDelete}
      />
      <GastoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={gastosMessages.confirmDelete.title}
        message={gastosMessages.confirmDelete.message(toDelete?.descripcion ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
