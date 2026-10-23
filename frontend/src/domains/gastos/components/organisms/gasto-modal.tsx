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
import { CuentaSelectField } from '@/domains/cuentas/components/molecules/cuenta-select';

import type { Gasto } from '@/types/gasto.types';

import { DEFAULT_GASTO_CATEGORIAS } from '../../constants';
import { gastoSchema, type GastoInput } from '../../gasto.schema';
import { useCreateGasto, useUpdateGasto } from '../../hooks/use-gastos';
import { gastosMessages } from '../../messages';

interface GastoModalProps {
  open: boolean;
  onClose: () => void;
  gasto?: Gasto | null;
  onCreated?: () => void;
}

export function GastoModal({ open, onClose, gasto = null, onCreated }: GastoModalProps) {
  const isEdit = gasto !== null;
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();
  const { data: categorias = [] } = useCategorias();

  const categoryOptions = useMemo(() => {
    const custom = categorias.map(categoria => categoria.nombre);
    const current = gasto ? [gasto.categoria] : [];
    return Array.from(new Set<string>([...DEFAULT_GASTO_CATEGORIAS, ...custom, ...current]));
  }, [categorias, gasto]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GastoInput>({
    resolver: zodResolver(gastoSchema),
    defaultValues: { categoria: DEFAULT_GASTO_CATEGORIAS[0], cuentaId: null }
  });

  useEffect(() => {
    if (!open) return;
    reset(
      gasto
        ? {
            descripcion: gasto.descripcion,
            monto: gasto.monto,
            categoria: gasto.categoria,
            cuentaId: gasto.cuentaId
          }
        : { categoria: DEFAULT_GASTO_CATEGORIAS[0], cuentaId: null }
    );
  }, [open, gasto, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEdit && gasto) {
        await updateGasto.mutateAsync({ id: gasto.id, data: values });
      } else {
        await createGasto.mutateAsync(values);
        onCreated?.();
      }
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  const isPending = createGasto.isPending || updateGasto.isPending;
  const error = createGasto.error ?? updateGasto.error;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title={isEdit ? gastosMessages.modal.editTitle : gastosMessages.modal.createTitle}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label={gastosMessages.modal.descriptionLabel}
          error={errors.descripcion?.message}
        >
          <Input
            placeholder={gastosMessages.modal.descriptionPlaceholder}
            aria-invalid={Boolean(errors.descripcion)}
            {...register('descripcion')}
          />
        </FormField>
        <FormField label={gastosMessages.modal.amountLabel} error={errors.monto?.message}>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.monto)}
            {...register('monto', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label={gastosMessages.modal.categoryLabel}
          error={errors.categoria?.message}
        >
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.categoria)}>
                  <SelectValue placeholder={gastosMessages.modal.categoryLabel} />
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
        <CuentaSelectField control={control} name="cuentaId" />
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
