'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { Button } from '@/components/ui/button';
import type { ModuloClave } from '@/types/modulo.types';

import { MODULOS_OPCIONALES } from '../../config';
import {
  useModulos,
  useModulosPersonalizados,
  useSetModuloActivo,
  useSetModuloPersonalizadoActivo
} from '../../hooks/use-modulos';
import { modulosMessages } from '../../messages';

type ModuloVisibilidadToggleProps = { clave: ModuloClave } | { personalizadoId: string };

const IMPACTO_PERSONALIZADO = 'Deja de mostrarse en el menú.';

export function ModuloVisibilidadToggle(props: ModuloVisibilidadToggleProps) {
  const { data: modulos = [] } = useModulos();
  const { data: personalizados = [] } = useModulosPersonalizados();
  const setModuloActivo = useSetModuloActivo();
  const setPersonalizadoActivo = useSetModuloPersonalizadoActivo();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isPersonalizado = 'personalizadoId' in props;
  const definition = isPersonalizado
    ? undefined
    : MODULOS_OPCIONALES.find(item => item.clave === props.clave);
  const personalizado = isPersonalizado
    ? personalizados.find(item => item.id === props.personalizadoId)
    : undefined;

  const activo = isPersonalizado
    ? (personalizado?.activo ?? false)
    : (modulos.find(item => item.clave === props.clave)?.activo ?? false);
  const nombre = isPersonalizado ? (personalizado?.nombre ?? '') : (definition?.label ?? '');
  const impacto = isPersonalizado ? IMPACTO_PERSONALIZADO : (definition?.impactoAlOcultar ?? '');
  const isPending = setModuloActivo.isPending || setPersonalizadoActivo.isPending;

  const setActivo = (nuevoActivo: boolean) => {
    if (isPersonalizado && personalizado) {
      setPersonalizadoActivo.mutate({ id: personalizado.id, activo: nuevoActivo });
    } else if (!isPersonalizado) {
      setModuloActivo.mutate({ clave: props.clave, activo: nuevoActivo });
    }
  };

  const handleClick = () => {
    if (activo) {
      setIsConfirmOpen(true);
      return;
    }
    setActivo(true);
  };

  const handleConfirm = () => {
    setActivo(false);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
        {activo ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {activo ? modulosMessages.actions.hide : modulosMessages.actions.show}
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        title={modulosMessages.confirmHide.title}
        message={modulosMessages.confirmHide.message(nombre, impacto)}
        confirmLabel={modulosMessages.confirmHide.confirm}
        destructive={false}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
