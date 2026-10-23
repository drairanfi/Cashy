'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { Button } from '@/components/ui/button';
import { CrearModuloModal } from '@/domains/modulos/components/organisms/crear-modulo-modal';
import { ModulosSection } from '@/domains/modulos/components/organisms/modulos-section';
import type { ModuloOpcionalDefinition } from '@/domains/modulos/config';
import {
  useDeleteModuloDatos,
  useDeleteModuloPersonalizado,
  useModulos,
  useModulosPersonalizados,
  useSetModuloActivo,
  useSetModuloPersonalizadoActivo
} from '@/domains/modulos/hooks/use-modulos';
import { modulosMessages } from '@/domains/modulos/messages';
import type { ModuloPersonalizado } from '@/types/modulo.types';

type PendingAction =
  | { kind: 'hide-modulo'; modulo: ModuloOpcionalDefinition }
  | { kind: 'delete-modulo'; modulo: ModuloOpcionalDefinition }
  | { kind: 'delete-personalizado'; modulo: ModuloPersonalizado };

export default function ModulesSettingsPage() {
  const { data: modulos = [], isLoading: isLoadingModulos } = useModulos();
  const { data: modulosPersonalizados = [], isLoading: isLoadingPersonalizados } =
    useModulosPersonalizados();
  const setModuloActivo = useSetModuloActivo();
  const deleteModuloDatos = useDeleteModuloDatos();
  const setPersonalizadoActivo = useSetModuloPersonalizadoActivo();
  const deleteModuloPersonalizado = useDeleteModuloPersonalizado();

  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleConfirm = async () => {
    if (!pendingAction) return;
    try {
      switch (pendingAction.kind) {
        case 'hide-modulo':
          await setModuloActivo.mutateAsync({ clave: pendingAction.modulo.clave, activo: false });
          break;
        case 'delete-modulo':
          await deleteModuloDatos.mutateAsync(pendingAction.modulo.clave);
          break;
        case 'delete-personalizado':
          await deleteModuloPersonalizado.mutateAsync(pendingAction.modulo.id);
          break;
      }
      setPendingAction(null);
    } catch {
      /* error surfaced through the mutation state */
    }
  };

  const dialog = pendingAction ? buildDialog(pendingAction) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{modulosMessages.tabs.modules}</h1>
          <p className="text-sm text-muted-foreground">{modulosMessages.pageSubtitle}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsCrearOpen(true)}>
          {modulosMessages.addModule.title}
        </Button>
      </header>

      <ModulosSection
        modulos={modulos}
        modulosPersonalizados={modulosPersonalizados}
        isLoading={isLoadingModulos || isLoadingPersonalizados}
        onToggle={(modulo, activo) =>
          activo
            ? setModuloActivo.mutate({ clave: modulo.clave, activo: true })
            : setPendingAction({ kind: 'hide-modulo', modulo })
        }
        onDelete={modulo => setPendingAction({ kind: 'delete-modulo', modulo })}
        onTogglePersonalizado={modulo =>
          setPersonalizadoActivo.mutate({ id: modulo.id, activo: !modulo.activo })
        }
        onDeletePersonalizado={modulo => setPendingAction({ kind: 'delete-personalizado', modulo })}
      />

      <CrearModuloModal open={isCrearOpen} onClose={() => setIsCrearOpen(false)} />
      <ConfirmDialog
        open={pendingAction !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.confirmLabel}
        destructive={dialog?.destructive}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

function buildDialog(action: PendingAction) {
  switch (action.kind) {
    case 'hide-modulo':
      return {
        title: modulosMessages.confirmHide.title,
        message: modulosMessages.confirmHide.message(
          action.modulo.label,
          action.modulo.impactoAlOcultar
        ),
        confirmLabel: modulosMessages.confirmHide.confirm,
        destructive: false
      };
    case 'delete-modulo':
      return {
        title: modulosMessages.confirmDelete.title,
        message: modulosMessages.confirmDelete.message(action.modulo.label),
        confirmLabel: 'Eliminar',
        destructive: true
      };
    case 'delete-personalizado':
      return {
        title: modulosMessages.confirmDelete.title,
        message: modulosMessages.confirmDelete.customMessage(action.modulo.nombre),
        confirmLabel: 'Eliminar',
        destructive: true
      };
  }
}
