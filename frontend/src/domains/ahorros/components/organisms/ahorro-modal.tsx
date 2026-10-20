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

import { ahorroSchema, type AhorroInput } from '../../ahorro.schema';
import { useCreateAhorro } from '../../hooks/use-ahorros';
import { ahorrosMessages } from '../../messages';

interface AhorroModalProps {
  open: boolean;
  onClose: () => void;
}

export function AhorroModal({ open, onClose }: AhorroModalProps) {
  const createAhorro = useCreateAhorro();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AhorroInput>({
    resolver: zodResolver(ahorroSchema),
    defaultValues: { actual: 0 }
  });

  useEffect(() => {
    if (open) reset({ actual: 0 });
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createAhorro.mutateAsync(values);
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={ahorrosMessages.modal.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={ahorrosMessages.modal.nameLabel} error={errors.nombre?.message}>
          <Input
            placeholder={ahorrosMessages.modal.namePlaceholder}
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
        </FormField>
        <FormField label={ahorrosMessages.modal.targetLabel} error={errors.objetivo?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.objetivo)}
            {...register('objetivo', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label={ahorrosMessages.modal.savedLabel} error={errors.actual?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.actual)}
            {...register('actual', { valueAsNumber: true })}
          />
        </FormField>
        {createAhorro.isError && (
          <p className="text-sm text-destructive">{(createAhorro.error as Error).message}</p>
        )}
        <Button type="submit" disabled={createAhorro.isPending} aria-busy={createAhorro.isPending}>
          {createAhorro.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
