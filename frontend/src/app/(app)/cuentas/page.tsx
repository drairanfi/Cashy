'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { CuentaModal } from '@/domains/cuentas/components/organisms/cuenta-modal';
import { CuentasSection } from '@/domains/cuentas/components/organisms/cuentas-section';
import { useCuentas } from '@/domains/cuentas/hooks/use-cuentas';
import { useDeleteCuenta } from '@/domains/cuentas/hooks/use-delete-cuenta';
import { cuentasMessages } from '@/domains/cuentas/messages';
import type { Cuenta } from '@/domains/cuentas/types/cuenta.types';

export default function AccountsPage() {
  const { data: cuentas = [], isLoading } = useCuentas();
  const deleteCuenta = useDeleteCuenta();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null);
  const [toDelete, setToDelete] = useState<Cuenta | null>(null);

  const openCreate = () => {
    setEditingCuenta(null);
    setIsModalOpen(true);
  };

  const openEdit = (cuenta: Cuenta) => {
    setEditingCuenta(cuenta);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (toDelete) deleteCuenta.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <CuentasSection
        cuentas={cuentas}
        isLoading={isLoading}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={setToDelete}
      />
      <CuentaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cuenta={editingCuenta}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title={cuentasMessages.confirmDelete.title}
        message={cuentasMessages.confirmDelete.message(toDelete?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
