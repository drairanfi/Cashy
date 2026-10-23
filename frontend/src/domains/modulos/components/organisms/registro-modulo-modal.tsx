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
import { CuentaSelectField } from '@/domains/cuentas/components/molecules/cuenta-select';

import { useCreateRegistroModulo } from '../../hooks/use-modulos';
import { modulosMessages } from '../../messages';
import { registroModuloSchema, type RegistroModuloInput } from '../../registro-modulo.schema';

interface RegistroModuloModalProps {
  open: boolean;
  onClose: () => void;
  moduloId: string;
}

export function RegistroModuloModal({ open, onClose, moduloId }: RegistroModuloModalProps) {
  const createRegistro = useCreateRegistroModulo(moduloId);
  const messages = modulosMessages.registro;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegistroModuloInput>({
    resolver: zodResolver(registroModuloSchema),
    defaultValues: { cuentaId: null }
  });

  useEffect(() => {
    if (open) reset({ cuentaId: null });
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createRegistro.mutateAsync(values);
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={messages.modalTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={messages.descriptionLabel} error={errors.descripcion?.message}>
          <Input
            placeholder={messages.descriptionPlaceholder}
            aria-invalid={Boolean(errors.descripcion)}
            {...register('descripcion')}
          />
        </FormField>
        <FormField label={messages.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        <CuentaSelectField control={control} name="cuentaId" />
        {createRegistro.isError && (
          <p className="text-sm text-destructive">{(createRegistro.error as Error).message}</p>
        )}
        <Button
          type="submit"
          disabled={createRegistro.isPending}
          aria-busy={createRegistro.isPending}
        >
          {createRegistro.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
