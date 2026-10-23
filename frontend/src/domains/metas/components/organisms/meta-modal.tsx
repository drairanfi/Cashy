'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ConfirmDialog } from '@/components/molecules/confirm-dialog';
import { FormField } from '@/components/molecules/form-field';
import { Modal } from '@/components/molecules/modal';
import { ModalHeader } from '@/components/molecules/modal-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commonMessages } from '@/config/messages';
import type { Meta } from '@/types/meta.types';

import { useCreateMeta, useDeleteMeta, useUpdateMeta } from '../../hooks/use-metas';
import { metaSchema, type MetaInput } from '../../meta.schema';
import { metasMessages } from '../../messages';

interface MetaModalProps {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
}

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultValues(): Partial<MetaInput> {
  return { prioritaria: false, fechaInicio: toDateInput(new Date()), fechaFin: '' };
}

export function MetaModal({ open, onClose, meta }: MetaModalProps) {
  const isEdit = meta !== null;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const createMeta = useCreateMeta();
  const updateMeta = useUpdateMeta();
  const deleteMeta = useDeleteMeta();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MetaInput>({
    resolver: zodResolver(metaSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    if (!open) return;
    reset(
      meta
        ? {
            nombre: meta.nombre,
            montoObjetivo: meta.montoObjetivo,
            montoMensual: meta.montoMensual,
            prioritaria: meta.prioritaria,
            fechaInicio: meta.fechaInicio.slice(0, 10),
            fechaFin: meta.fechaFin ? meta.fechaFin.slice(0, 10) : ''
          }
        : getDefaultValues()
    );
  }, [open, meta, reset]);

  const onSubmit = handleSubmit(async values => {
    const payload = { ...values, fechaFin: values.fechaFin || null };
    try {
      if (isEdit && meta) {
        await updateMeta.mutateAsync({ id: meta.id, data: payload });
      } else {
        await createMeta.mutateAsync(payload);
      }
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  const handleDelete = async () => {
    if (!meta) return;
    try {
      await deleteMeta.mutateAsync(meta.id);
      setIsConfirmOpen(false);
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  };

  const isPending = createMeta.isPending || updateMeta.isPending || deleteMeta.isPending;
  const error = createMeta.error ?? updateMeta.error ?? deleteMeta.error;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalHeader
          title={isEdit ? metasMessages.modal.editTitle : metasMessages.modal.createTitle}
          onClose={onClose}
        />
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label={metasMessages.modal.nameLabel} error={errors.nombre?.message}>
            <Input
              placeholder={metasMessages.modal.namePlaceholder}
              aria-invalid={Boolean(errors.nombre)}
              {...register('nombre')}
            />
          </FormField>
          <FormField
            label={metasMessages.modal.targetLabel}
            error={errors.montoObjetivo?.message}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="0"
              aria-invalid={Boolean(errors.montoObjetivo)}
              {...register('montoObjetivo', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={metasMessages.modal.monthlyLabel}
            error={errors.montoMensual?.message}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="0"
              aria-invalid={Boolean(errors.montoMensual)}
              {...register('montoMensual', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={metasMessages.modal.startDateLabel}
            error={errors.fechaInicio?.message}
          >
            <Input
              type="date"
              aria-invalid={Boolean(errors.fechaInicio)}
              {...register('fechaInicio')}
            />
          </FormField>
          <FormField label={metasMessages.modal.endDateLabel} error={errors.fechaFin?.message}>
            <Input type="date" aria-invalid={Boolean(errors.fechaFin)} {...register('fechaFin')} />
          </FormField>
          <label className="flex items-start gap-2 rounded-xl border border-border p-3">
            <input type="checkbox" className="mt-0.5 size-4" {...register('prioritaria')} />
            <span>
              <span className="block text-sm font-medium text-foreground">
                {metasMessages.modal.priorityTitle}
              </span>
              <span className="block text-xs text-muted-foreground">
                {metasMessages.modal.priorityHint}
              </span>
            </span>
          </label>
          {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
          <Button type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? commonMessages.actions.saving : commonMessages.actions.save}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isPending}
            >
              {metasMessages.modal.deleteAction}
            </Button>
          )}
        </form>
      </Modal>
      <ConfirmDialog
        open={isConfirmOpen}
        title={metasMessages.confirmDelete.title}
        message={metasMessages.confirmDelete.message(meta?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
