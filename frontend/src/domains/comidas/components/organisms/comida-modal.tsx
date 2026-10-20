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

import { comidaSchema, type ComidaInput } from '../../comida.schema';
import { useCreateComida } from '../../hooks/use-comidas';
import { comidasMessages } from '../../messages';

interface ComidaModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function ComidaModal({ open, onClose, onCreated }: ComidaModalProps) {
  const createComida = useCreateComida();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ComidaInput>({ resolver: zodResolver(comidaSchema) });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createComida.mutateAsync(values);
      onCreated?.();
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={comidasMessages.modal.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label={comidasMessages.modal.descriptionLabel}
          error={errors.descripcion?.message}
        >
          <Input
            placeholder={comidasMessages.modal.descriptionPlaceholder}
            aria-invalid={Boolean(errors.descripcion)}
            {...register('descripcion')}
          />
        </FormField>
        <FormField label={comidasMessages.modal.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        {createComida.isError && (
          <p className="text-sm text-destructive">{(createComida.error as Error).message}</p>
        )}
        <Button type="submit" disabled={createComida.isPending} aria-busy={createComida.isPending}>
          {createComida.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
