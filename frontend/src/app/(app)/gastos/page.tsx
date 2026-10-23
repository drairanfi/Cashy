'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

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
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [toDelete, setToDelete] = useState<Gasto | null>(null);

  const openCreate = () => {
    setEditingGasto(null);
    setIsModalOpen(true);
  };

  const openEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (toDelete) deleteGasto.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="gastos" />
      </div>
      <GastosSection
        gastos={gastos}
        isLoading={isLoading}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={setToDelete}
      />
      <GastoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gasto={editingGasto}
      />
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
