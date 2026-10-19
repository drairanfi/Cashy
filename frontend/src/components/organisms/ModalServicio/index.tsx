import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServicioSchema, type CreateServicioInput } from '@/schemas/servicio';
import { useCreateServicio, useUpdateServicio, useDeleteServicio } from '@/hooks/useServicios';
import type { Servicio } from '@/types';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface ModalServicioProps {
  open: boolean;
  onClose: () => void;
  servicio: Servicio | null;
}

export function ModalServicio({ open, onClose, servicio }: ModalServicioProps) {
  const isEdit = servicio !== null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const createServicio = useCreateServicio();
  const updateServicio = useUpdateServicio();
  const deleteServicio = useDeleteServicio();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServicioInput>({ resolver: zodResolver(createServicioSchema) });

  useEffect(() => {
    if (open) {
      reset(
        servicio
          ? { nombre: servicio.nombre, montoDestinado: servicio.montoDestinado }
          : {},
      );
    }
  }, [open, servicio, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await updateServicio.mutateAsync({ id: servicio.id, data });
    } else {
      await createServicio.mutateAsync(data);
    }
    reset();
    onClose();
  });

  const handleDelete = () => {
    if (servicio) {
      setConfirmOpen(true);
    }
  };

  const doDelete = async () => {
    if (servicio) {
      await deleteServicio.mutateAsync(servicio.id);
      setConfirmOpen(false);
      onClose();
    }
  };

  const isPending = createServicio.isPending || updateServicio.isPending || deleteServicio.isPending;
  const error = createServicio.error ?? updateServicio.error ?? deleteServicio.error;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <ModalHeader title={isEdit ? 'Editar servicio' : 'Crear servicio'} onClose={onClose} />
          <form onSubmit={onSubmit} className="modal__body">
            <FormField label="Nombre" error={errors.nombre?.message}>
              <Input {...register('nombre')} error={!!errors.nombre} placeholder="Gym" />
            </FormField>
            <FormField label="Monto destinado" error={errors.montoDestinado?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('montoDestinado', { valueAsNumber: true })}
                error={!!errors.montoDestinado}
                placeholder="0"
              />
            </FormField>
            {error && <p className="form-field__error">{(error as Error).message}</p>}
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
                Eliminar servicio
              </Button>
            )}
          </form>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar servicio"
        message={servicio ? `¿Estás seguro de eliminar "${servicio.nombre}"?` : ''}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
