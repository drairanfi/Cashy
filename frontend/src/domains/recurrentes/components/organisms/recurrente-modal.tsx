'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
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
import { useCategorias } from '@/domains/categorias/hooks/use-categorias';
import { DEFAULT_GASTO_CATEGORIAS } from '@/domains/gastos/constants';

import { useCreateRecurrente } from '../../hooks/use-create-recurrente';
import { recurrentesMessages } from '../../messages';
import {
  RECURRENTE_FRECUENCIAS,
  recurrenteSchema,
  type RecurrenteInput
} from '../../recurrente.schema';

interface RecurrenteModalProps {
  open: boolean;
  onClose: () => void;
}

function getDefaultValues(): RecurrenteInput {
  return {
    concepto: '',
    monto: 0,
    categoria: '',
    frecuencia: 'mensual',
    intervalo: 1,
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: ''
  };
}

export function RecurrenteModal({ open, onClose }: RecurrenteModalProps) {
  const createRecurrente = useCreateRecurrente();
  const { data: categorias = [] } = useCategorias();

  const categoryOptions = useMemo(() => {
    const custom = categorias.map(categoria => categoria.nombre);
    return Array.from(new Set<string>([...DEFAULT_GASTO_CATEGORIAS, ...custom]));
  }, [categorias]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RecurrenteInput>({
    resolver: zodResolver(recurrenteSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (open) reset(getDefaultValues());
  }, [open, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      await createRecurrente.mutateAsync({
        concepto: values.concepto,
        monto: values.monto,
        categoria: values.categoria?.trim() ? values.categoria : undefined,
        frecuencia: values.frecuencia,
        intervalo: values.intervalo,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin?.trim() ? values.fechaFin : null
      });
      reset(getDefaultValues());
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={recurrentesMessages.modal.createTitle} onClose={onClose} />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={recurrentesMessages.modal.conceptLabel} error={errors.concepto?.message}>
          <Input
            placeholder={recurrentesMessages.modal.conceptPlaceholder}
            aria-invalid={Boolean(errors.concepto)}
            {...register('concepto')}
          />
        </FormField>

        <FormField label={recurrentesMessages.modal.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label={recurrentesMessages.modal.categoryLabel}
          error={errors.categoria?.message}
        >
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={Boolean(errors.categoria)}
                >
                  <SelectValue placeholder={recurrentesMessages.modal.categoryLabel} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label={recurrentesMessages.modal.frequencyLabel}
          error={errors.frecuencia?.message}
        >
          <Controller
            control={control}
            name="frecuencia"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.frecuencia)}>
                  <SelectValue placeholder={recurrentesMessages.modal.frequencyLabel} />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENTE_FRECUENCIAS.map(frecuencia => (
                    <SelectItem key={frecuencia} value={frecuencia}>
                      {recurrentesMessages.frequency[frecuencia]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label={recurrentesMessages.modal.intervalLabel}
          error={errors.intervalo?.message}
        >
          <Input
            type="number"
            step="1"
            placeholder={recurrentesMessages.modal.intervalPlaceholder}
            aria-invalid={Boolean(errors.intervalo)}
            {...register('intervalo', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label={recurrentesMessages.modal.startDateLabel}
          error={errors.fechaInicio?.message}
        >
          <Input
            type="date"
            aria-invalid={Boolean(errors.fechaInicio)}
            {...register('fechaInicio')}
          />
        </FormField>

        <FormField
          label={recurrentesMessages.modal.endDateLabel}
          error={errors.fechaFin?.message}
        >
          <Input
            type="date"
            aria-invalid={Boolean(errors.fechaFin)}
            {...register('fechaFin')}
          />
        </FormField>

        {createRecurrente.isError && (
          <p className="text-sm text-destructive">{(createRecurrente.error as Error).message}</p>
        )}

        <Button
          type="submit"
          disabled={createRecurrente.isPending}
          aria-busy={createRecurrente.isPending}
        >
          {createRecurrente.isPending
            ? commonMessages.actions.saving
            : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
