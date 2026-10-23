'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/molecules/form-field';
import { Modal } from '@/components/molecules/modal';
import { ModalHeader } from '@/components/molecules/modal-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commonMessages } from '@/config/messages';

import { moduloPersonalizadoSchema, type ModuloPersonalizadoInput } from '../../modulo-personalizado.schema';
import { useCreateModuloPersonalizado } from '../../hooks/use-modulos';
import { modulosMessages } from '../../messages';

interface CrearModuloModalProps {
  open: boolean;
  onClose: () => void;
}

export function CrearModuloModal({ open, onClose }: CrearModuloModalProps) {
  const createModulo = useCreateModuloPersonalizado();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ModuloPersonalizadoInput>({ resolver: zodResolver(moduloPersonalizadoSchema) });

  useEffect(() => {
    if (open) reset({ nombre: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createModulo.mutateAsync(values.nombre);
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={modulosMessages.addModule.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={modulosMessages.addModule.nameLabel} error={errors.nombre?.message}>
          <Input
            placeholder={modulosMessages.addModule.namePlaceholder}
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
        </FormField>
        {createModulo.isError && (
          <p className="text-sm text-destructive">{(createModulo.error as Error).message}</p>
        )}
        <Button
          type="submit"
          disabled={createModulo.isPending}
          aria-busy={createModulo.isPending}
        >
          {createModulo.isPending ? commonMessages.actions.saving : commonMessages.actions.create}
        </Button>
      </form>
    </Modal>
  );
}
