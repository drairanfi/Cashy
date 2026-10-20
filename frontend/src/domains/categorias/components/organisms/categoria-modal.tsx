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
import type { Categoria } from '@/types/categoria.types';

import { categoriaSchema, type CategoriaInput } from '../../categoria.schema';
import {
  useCreateCategoria,
  useDeleteCategoria,
  useUpdateCategoria
} from '../../hooks/use-categorias';
import { categoriasMessages } from '../../messages';

interface CategoriaModalProps {
  open: boolean;
  onClose: () => void;
  categoria: Categoria | null;
}

export function CategoriaModal({ open, onClose, categoria }: CategoriaModalProps) {
  const isEdit = categoria !== null;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const deleteCategoria = useDeleteCategoria();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoriaInput>({ resolver: zodResolver(categoriaSchema) });

  useEffect(() => {
    if (!open) return;
    reset(categoria ? { nombre: categoria.nombre } : undefined);
  }, [open, categoria, reset]);

  const onSubmit = handleSubmit(async values => {
    try {
      if (isEdit && categoria) {
        await updateCategoria.mutateAsync({ id: categoria.id, data: values });
      } else {
        await createCategoria.mutateAsync(values);
      }
      reset();
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  });

  const handleDelete = async () => {
    if (!categoria) return;
    try {
      await deleteCategoria.mutateAsync(categoria.id);
      setIsConfirmOpen(false);
      onClose();
    } catch {
      /* error surfaced through the mutation state */
    }
  };

  const isPending =
    createCategoria.isPending || updateCategoria.isPending || deleteCategoria.isPending;
  const error = createCategoria.error ?? updateCategoria.error ?? deleteCategoria.error;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalHeader
          title={
            isEdit ? categoriasMessages.modal.editTitle : categoriasMessages.modal.createTitle
          }
          onClose={onClose}
        />
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label={categoriasMessages.modal.nameLabel} error={errors.nombre?.message}>
            <Input
              placeholder={categoriasMessages.modal.namePlaceholder}
              aria-invalid={Boolean(errors.nombre)}
              {...register('nombre')}
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
              {categoriasMessages.modal.deleteAction}
            </Button>
          )}
        </form>
      </Modal>
      <ConfirmDialog
        open={isConfirmOpen}
        title={categoriasMessages.confirmDelete.title}
        message={categoriasMessages.confirmDelete.message(categoria?.nombre ?? '')}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
