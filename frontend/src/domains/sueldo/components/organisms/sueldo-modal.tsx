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

import { useUpsertSueldo } from '../../hooks/use-sueldo';
import { sueldoMessages } from '../../messages';
import { upsertSueldoSchema, type UpsertSueldoInput } from '../../sueldo.schema';

interface SueldoModalProps {
  open: boolean;
  onClose: () => void;
  currentAmount?: number;
}

export function SueldoModal({ open, onClose, currentAmount }: SueldoModalProps) {
  const upsertSueldo = useUpsertSueldo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UpsertSueldoInput>({ resolver: zodResolver(upsertSueldoSchema) });

  useEffect(() => {
    if (open) reset({ monto: currentAmount });
  }, [open, currentAmount, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await upsertSueldo.mutateAsync(values.monto);
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={sueldoMessages.modalTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={sueldoMessages.fieldLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        {upsertSueldo.isError && (
          <p className="text-sm text-destructive">{(upsertSueldo.error as Error).message}</p>
        )}
        <Button type="submit" disabled={upsertSueldo.isPending} aria-busy={upsertSueldo.isPending}>
          {upsertSueldo.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
