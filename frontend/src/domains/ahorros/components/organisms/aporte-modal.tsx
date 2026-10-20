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
import type { Ahorro } from '@/types/ahorro.types';

import { aporteSchema, type AporteInput } from '../../aporte.schema';
import { useAportarAhorro } from '../../hooks/use-ahorros';
import { ahorrosMessages } from '../../messages';

interface AporteModalProps {
  open: boolean;
  ahorro: Ahorro | null;
  onClose: () => void;
}

export function AporteModal({ open, ahorro, onClose }: AporteModalProps) {
  const aportarAhorro = useAportarAhorro();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AporteInput>({ resolver: zodResolver(aporteSchema) });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    if (!ahorro) return;
    try {
      await aportarAhorro.mutateAsync({ id: ahorro.id, monto: values.monto });
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={ahorrosMessages.aporte.title} onClose={onClose} />
      <p className="mb-4 text-sm text-muted-foreground">
        {ahorrosMessages.aporte.message(ahorro?.nombre ?? '')}
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={ahorrosMessages.aporte.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        {aportarAhorro.isError && (
          <p className="text-sm text-destructive">{(aportarAhorro.error as Error).message}</p>
        )}
        <Button
          type="submit"
          disabled={aportarAhorro.isPending}
          aria-busy={aportarAhorro.isPending}
        >
          {aportarAhorro.isPending
            ? commonMessages.actions.saving
            : ahorrosMessages.aporte.action}
        </Button>
      </form>
    </Modal>
  );
}
