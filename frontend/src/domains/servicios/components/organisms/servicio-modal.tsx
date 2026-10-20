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
import type { Servicio } from '@/types/servicio.types';

import {
  useCreateServicio,
  useDeleteServicio,
  useUpdateServicio
} from '../../hooks/use-servicios';
import { servicioSchema, type ServicioInput } from '../../servicio.schema';
import { serviciosMessages } from '../../messages';

interface ServicioModalProps {
  open: boolean;
  onClose: () => void;
  servicio: Servicio | null;
}

export function ServicioModal({ open, onClose, servicio }: ServicioModalProps) {
  const isEdit = servicio !== null;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const createServicio = useCreateServicio();
  const updateServicio = useUpdateServicio();
  const deleteServicio = useDeleteServicio();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ServicioInput>({ resolver: zodResolver(servicioSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      servicio
        ? { nombre: servicio.nombre, montoDestinado: servicio.montoDestinado }
        : undefined
    );
  }, [open, servicio, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEdit && servicio) {
        await updateServicio.mutateAsync({ id: servicio.id, data: values });
      } else {
        await createServicio.mutateAsync(values);
      }
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  const handleDelete = async () => {
    if (!servicio) return;
    try {
      await deleteServicio.mutateAsync(servicio.id);
      setIsConfirmOpen(false);
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  };

  const isPending = createServicio.isPending || updateServicio.isPending || deleteServicio.isPending;
  const error = createServicio.error ?? updateServicio.error ?? deleteServicio.error;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalHeader
          title={
            isEdit ? serviciosMessages.modal.editTitle : serviciosMessages.modal.createTitle
          }
          onClose={onClose}
        />
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label={serviciosMessages.modal.nameLabel} error={errors.nombre?.message}>
            <Input
              placeholder={serviciosMessages.modal.namePlaceholder}
              aria-invalid={Boolean(errors.nombre)}
              {...register('nombre')}
            />
          </FormField>
          <FormField
            label={serviciosMessages.modal.amountLabel}
            error={errors.montoDestinado?.message}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="0"
              aria-invalid={Boolean(errors.montoDestinado)}
              {...register('montoDestinado', { valueAsNumber: true })}
            />
          </FormField>
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
              {serviciosMessages.modal.deleteAction}
            </Button>
          )}
        </form>
      </Modal>
      <ConfirmDialog
        open={isConfirmOpen}
        title={serviciosMessages.confirmDelete.title}
        message={serviciosMessages.confirmDelete.message(servicio?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
