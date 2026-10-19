import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMetaSchema, type CreateMetaInput } from '@/schemas/meta';
import { useCreateMeta, useUpdateMeta, useDeleteMeta } from '@/hooks/useMetas';
import type { Meta } from '@/types';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface ModalMetaProps {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
}

export function ModalMeta({ open, onClose, meta }: ModalMetaProps) {
  const isEdit = meta !== null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const createMeta = useCreateMeta();
  const updateMeta = useUpdateMeta();
  const deleteMeta = useDeleteMeta();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMetaInput>({ resolver: zodResolver(createMetaSchema) });

  useEffect(() => {
    if (open) {
      reset(
        meta
          ? {
              nombre: meta.nombre,
              montoObjetivo: meta.montoObjetivo,
              montoMensual: meta.montoMensual,
              prioritaria: meta.prioritaria,
            }
          : { prioritaria: false },
      );
    }
  }, [open, meta, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await updateMeta.mutateAsync({ id: meta.id, data });
    } else {
      await createMeta.mutateAsync(data);
    }
    reset();
    onClose();
  });

  const handleDelete = () => {
    if (meta) {
      setConfirmOpen(true);
    }
  };

  const doDelete = async () => {
    if (meta) {
      await deleteMeta.mutateAsync(meta.id);
      setConfirmOpen(false);
      onClose();
    }
  };

  const isPending = createMeta.isPending || updateMeta.isPending || deleteMeta.isPending;
  const error = createMeta.error ?? updateMeta.error ?? deleteMeta.error;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <ModalHeader title={isEdit ? 'Editar meta' : 'Crear meta'} onClose={onClose} />
          <form onSubmit={onSubmit} className="modal__body">
            <FormField label="Nombre" error={errors.nombre?.message}>
              <Input {...register('nombre')} error={!!errors.nombre} placeholder="Viaje a Europa" />
            </FormField>
            <FormField label="Monto objetivo" error={errors.montoObjetivo?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('montoObjetivo', { valueAsNumber: true })}
                error={!!errors.montoObjetivo}
                placeholder="0"
              />
            </FormField>
            <FormField label="Monto mensual" error={errors.montoMensual?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('montoMensual', { valueAsNumber: true })}
                error={!!errors.montoMensual}
                placeholder="0"
              />
            </FormField>
            <label className="meta-priority">
              <input type="checkbox" className="meta-priority__input" {...register('prioritaria')} />
              <span>
                <span className="meta-priority__title">Esta es mi meta grande</span>
                <span className="meta-priority__hint">
                  Casa, auto, moto, viaje importante... Cashy le dará prioridad en sus consejos.
                </span>
              </span>
            </label>
            {error && <p className="form-field__error">{(error as Error).message}</p>}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
                Eliminar meta
              </Button>
            )}
          </form>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar meta"
        message={meta ? `¿Estás seguro de eliminar "${meta.nombre}"?` : ''}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
