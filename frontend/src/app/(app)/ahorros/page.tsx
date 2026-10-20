'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { AhorroModal } from '@/domains/ahorros/components/organisms/ahorro-modal';
import { AhorrosSection } from '@/domains/ahorros/components/organisms/ahorros-section';
import { AporteModal } from '@/domains/ahorros/components/organisms/aporte-modal';
import { useDeleteAhorro, useAhorros } from '@/domains/ahorros/hooks/use-ahorros';
import { ahorrosMessages } from '@/domains/ahorros/messages';
import type { Ahorro } from '@/types/ahorro.types';

export default function SavingsPage() {
  const { data: ahorros = [], isLoading } = useAhorros();
  const deleteAhorro = useDeleteAhorro();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toContribute, setToContribute] = useState<Ahorro | null>(null);
  const [toDelete, setToDelete] = useState<Ahorro | null>(null);

  const handleDelete = () => {
    if (toDelete) deleteAhorro.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <AhorrosSection
        ahorros={ahorros}
        isLoading={isLoading}
        onCreate={() => setIsModalOpen(true)}
        onContribute={setToContribute}
        onDelete={setToDelete}
      />
      <AhorroModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AporteModal
        open={toContribute !== null}
        ahorro={toContribute}
        onClose={() => setToContribute(null)}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title={ahorrosMessages.confirmDelete.title}
        message={ahorrosMessages.confirmDelete.message(toDelete?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
