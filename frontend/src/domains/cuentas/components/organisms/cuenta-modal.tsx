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

import { CUENTA_TIPOS, cuentaSchema, type CuentaInput } from '../../cuenta.schema';
import { useCreateCuenta } from '../../hooks/use-create-cuenta';
import { useUpdateCuenta } from '../../hooks/use-update-cuenta';
import { cuentasMessages } from '../../messages';
import type { Cuenta } from '../../types/cuenta.types';

interface CuentaModalProps {
  open: boolean;
  onClose: () => void;
  cuenta: Cuenta | null;
}

function getDefaultValues(): CuentaInput {
  return { nombre: '', tipo: 'efectivo', saldoInicial: 0 };
}

export function CuentaModal({ open, onClose, cuenta }: CuentaModalProps) {
  const isEdit = cuenta !== null;
  const createCuenta = useCreateCuenta();
  const updateCuenta = useUpdateCuenta();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CuentaInput>({
    resolver: zodResolver(cuentaSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (!open) return;
    reset(
      cuenta
        ? { nombre: cuenta.nombre, tipo: cuenta.tipo, saldoInicial: cuenta.saldoInicial }
        : getDefaultValues()
    );
  }, [open, cuenta, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEdit && cuenta) {
        await updateCuenta.mutateAsync({ id: cuenta.id, data: values });
      } else {
        await createCuenta.mutateAsync(values);
      }
      reset(getDefaultValues());
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  const isPending = createCuenta.isPending || updateCuenta.isPending;
  const error = createCuenta.error ?? updateCuenta.error;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title={isEdit ? cuentasMessages.modal.editTitle : cuentasMessages.modal.createTitle}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={cuentasMessages.modal.nameLabel} error={errors.nombre?.message}>
          <Input
            placeholder={cuentasMessages.modal.namePlaceholder}
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
        </FormField>

        <FormField label={cuentasMessages.modal.typeLabel} error={errors.tipo?.message}>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.tipo)}>
                  <SelectValue placeholder={cuentasMessages.modal.typeLabel} />
                </SelectTrigger>
                <SelectContent>
                  {CUENTA_TIPOS.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {cuentasMessages.type[tipo]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label={cuentasMessages.modal.initialLabel}
          error={errors.saldoInicial?.message}
        >
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            aria-invalid={Boolean(errors.saldoInicial)}
            {...register('saldoInicial', { valueAsNumber: true })}
          />
        </FormField>

        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? commonMessages.actions.saving : commonMessages.actions.save}
        </Button>
      </form>
    </Modal>
  );
}
