'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FormField } from '@/components/molecules/form-field';
import { Modal } from '@/components/molecules/modal';
import { ModalHeader } from '@/components/molecules/modal-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { commonMessages } from '@/config/messages';

import {
  DEUDA_DIRECCIONES,
  DEUDA_FRECUENCIAS,
  deudaSchema,
  type DeudaInput
} from '../../deuda.schema';
import { useCreateDeuda } from '../../hooks/use-create-deuda';
import { deudasMessages } from '../../messages';

interface DeudaModalProps {
  open: boolean;
  onClose: () => void;
}

function getDefaultValues(): Partial<DeudaInput> {
  return {
    direccion: 'debida',
    frecuencia: 'mensual',
    primeraFecha: new Date().toISOString().slice(0, 10)
  };
}

export function DeudaModal({ open, onClose }: DeudaModalProps) {
  const createDeuda = useCreateDeuda();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DeudaInput>({
    resolver: zodResolver(deudaSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (open) reset(getDefaultValues());
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createDeuda.mutateAsync(values);
      reset(getDefaultValues());
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={deudasMessages.modal.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={deudasMessages.modal.nameLabel} error={errors.nombre?.message}>
          <Input
            placeholder={deudasMessages.modal.namePlaceholder}
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
        </FormField>

        <FormField label={deudasMessages.modal.directionLabel} error={errors.direccion?.message}>
          <Controller
            control={control}
            name="direccion"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.direccion)}>
                  <SelectValue placeholder={deudasMessages.modal.directionLabel} />
                </SelectTrigger>
                <SelectContent>
                  {DEUDA_DIRECCIONES.map(direccion => (
                    <SelectItem key={direccion} value={direccion}>
                      {deudasMessages.direction[direccion]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label={deudasMessages.modal.amountLabel} error={errors.montoTotal?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.montoTotal)}
            {...register('montoTotal', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label={deudasMessages.modal.installmentsLabel}
          error={errors.cantidadCuotas?.message}
        >
          <Input
            type="number"
            step="1"
            placeholder={deudasMessages.modal.installmentsPlaceholder}
            aria-invalid={Boolean(errors.cantidadCuotas)}
            {...register('cantidadCuotas', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label={deudasMessages.modal.frequencyLabel}
          error={errors.frecuencia?.message}
        >
          <Controller
            control={control}
            name="frecuencia"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.frecuencia)}>
                  <SelectValue placeholder={deudasMessages.modal.frequencyLabel} />
                </SelectTrigger>
                <SelectContent>
                  {DEUDA_FRECUENCIAS.map(frecuencia => (
                    <SelectItem key={frecuencia} value={frecuencia}>
                      {deudasMessages.frequency[frecuencia]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label={deudasMessages.modal.firstDateLabel} error={errors.primeraFecha?.message}>
          <Input
            type="date"
            aria-invalid={Boolean(errors.primeraFecha)}
            {...register('primeraFecha')}
          />
        </FormField>

        {createDeuda.isError && (
          <p className="text-sm text-destructive">{(createDeuda.error as Error).message}</p>
        )}

        <Button type="submit" disabled={createDeuda.isPending} aria-busy={createDeuda.isPending}>
          {createDeuda.isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
