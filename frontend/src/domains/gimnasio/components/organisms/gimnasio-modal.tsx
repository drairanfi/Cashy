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

import { gimnasioSchema, type GimnasioInput } from '../../gimnasio.schema';
import { useCreateGimnasio } from '../../hooks/use-gimnasio';
import { gimnasioMessages } from '../../messages';

interface GimnasioModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function GimnasioModal({ open, onClose, onCreated }: GimnasioModalProps) {
  const createGimnasio = useCreateGimnasio();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GimnasioInput>({
    resolver: zodResolver(gimnasioSchema),
    defaultValues: { cuentaId: null }
  });

  useEffect(() => {
    if (open) reset({ cuentaId: null });
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createGimnasio.mutateAsync(values);
      onCreated?.();
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={gimnasioMessages.modal.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label={gimnasioMessages.modal.activityLabel}
          error={errors.actividad?.message}
        >
          <Input
            placeholder={gimnasioMessages.modal.activityPlaceholder}
            aria-invalid={Boolean(errors.actividad)}
            {...register('actividad')}
          />
        </FormField>
        <FormField label={gimnasioMessages.modal.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        <CuentaSelectField control={control} name="cuentaId" />
        {createGimnasio.isError && (
          <p className="text-sm text-destructive">{(createGimnasio.error as Error).message}</p>
        )}
        <Button
          type="submit"
          disabled={createGimnasio.isPending}
          aria-busy={createGimnasio.isPending}
        >
          {createGimnasio.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
