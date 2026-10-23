'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { GimnasioModal } from '@/domains/gimnasio/components/organisms/gimnasio-modal';
import { GimnasioSection } from '@/domains/gimnasio/components/organisms/gimnasio-section';
import { useDeleteGimnasio, useGimnasio } from '@/domains/gimnasio/hooks/use-gimnasio';
import { gimnasioMessages } from '@/domains/gimnasio/messages';
import type { GimnasioRegistro } from '@/types/gimnasio.types';

export default function GymPage() {
  const { data: registros = [], isLoading } = useGimnasio();
  const deleteGimnasio = useDeleteGimnasio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GimnasioRegistro | null>(null);

  const handleDelete = () => {
    if (toDelete) deleteGimnasio.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="gimnasio" />
      </div>
      <GimnasioSection
        registros={registros}
        isLoading={isLoading}
        onCreate={() => setIsModalOpen(true)}
        onDelete={setToDelete}
      />
      <GimnasioModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={gimnasioMessages.confirmDelete.title}
        message={gimnasioMessages.confirmDelete.message(toDelete?.actividad ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
