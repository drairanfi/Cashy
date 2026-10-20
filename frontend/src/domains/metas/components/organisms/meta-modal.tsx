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
    defaultValues: { prioritaria: false }
  });

  useEffect(() => {
    if (!open) return;
    reset(
      meta
        ? {
            nombre: meta.nombre,
            montoObjetivo: meta.montoObjetivo,
            montoMensual: meta.montoMensual,
            prioritaria: meta.prioritaria
          }
        : { prioritaria: false }
    );
  }, [open, meta, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEdit && meta) {
        await updateMeta.mutateAsync({ id: meta.id, data: values });
      } else {
        await createMeta.mutateAsync(values);
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
