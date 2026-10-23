'use client';

import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { ComidaModal } from '@/domains/comidas/components/organisms/comida-modal';
import { ComidasSection } from '@/domains/comidas/components/organisms/comidas-section';
import { useDeleteComida, useComidas } from '@/domains/comidas/hooks/use-comidas';
import { comidasMessages } from '@/domains/comidas/messages';
import type { Comida } from '@/types/comida.types';

export default function FoodPage() {
  const { data: comidas = [], isLoading } = useComidas();
  const deleteComida = useDeleteComida();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Comida | null>(null);

  const handleDelete = () => {
    if (toDelete) deleteComida.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle clave="comida" />
      </div>
      <ComidasSection
        comidas={comidas}
        isLoading={isLoading}
        onCreate={() => setIsModalOpen(true)}
        onDelete={setToDelete}
      />
      <ComidaModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={comidasMessages.confirmDelete.title}
        message={comidasMessages.confirmDelete.message(toDelete?.descripcion ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
