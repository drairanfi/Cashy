'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { ListSkeleton } from '@/components/molecules/list-skeleton';
import { ModuloVisibilidadToggle } from '@/domains/modulos/components/organisms/modulo-visibilidad-toggle';
import { RegistroModuloModal } from '@/domains/modulos/components/organisms/registro-modulo-modal';
import { RegistrosModuloSection } from '@/domains/modulos/components/organisms/registros-modulo-section';
import {
  useDeleteRegistroModulo,
  useModulosPersonalizados,
  useRegistrosModulo
} from '@/domains/modulos/hooks/use-modulos';
import { modulosMessages } from '@/domains/modulos/messages';
import type { RegistroModulo } from '@/types/modulo.types';

export default function ModuloDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: modulos = [], isLoading } = useModulosPersonalizados();
  const { data: registros = [], isLoading: isLoadingRegistros } = useRegistrosModulo(params.id);
  const deleteRegistro = useDeleteRegistroModulo(params.id);

  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<RegistroModulo | null>(null);

  const modulo = modulos.find(item => item.id === params.id);

  if (isLoading) return <ListSkeleton count={1} />;

  if (!modulo) {
    return <p className="text-muted-foreground">Módulo no encontrado.</p>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ModuloVisibilidadToggle personalizadoId={modulo.id} />
      </div>
      <RegistrosModuloSection
        moduloNombre={modulo.nombre}
        registros={registros}
        isLoading={isLoadingRegistros}
        onCreate={() => setIsRegistroOpen(true)}
        onDelete={setRegistroToDelete}
      />
      <RegistroModuloModal
        open={isRegistroOpen}
        onClose={() => setIsRegistroOpen(false)}
        moduloId={modulo.id}
      />
      <ConfirmDialog
        open={registroToDelete !== null}
        title={modulosMessages.registro.confirmDelete.title}
        message={modulosMessages.registro.confirmDelete.message(
          registroToDelete?.descripcion ?? ''
        )}
        onConfirm={async () => {
          if (registroToDelete) await deleteRegistro.mutateAsync(registroToDelete.id);
          setRegistroToDelete(null);
        }}
        onCancel={() => setRegistroToDelete(null)}
      />
    </>
  );
}
