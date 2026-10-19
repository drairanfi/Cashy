import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gastoFormSchema, simpleGastoFormSchema } from '@/schemas/movimientos';
import { GASTO_CATEGORIAS } from '@/types';
import { useCategorias } from '@/hooks/useCategorias';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

export interface GastoFormData {
  descripcion: string;
  monto: number;
  categoria?: string;
}

interface ModalGastoProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GastoFormData) => void | Promise<unknown>;
  title: string;
  labelDescripcion?: string;
  conCategoria?: boolean;
  submitLabel?: string;
  submitting?: boolean;
}

export function ModalGasto({
  open,
  onClose,
  onSave,
  title,
  labelDescripcion = 'Descripción',
  conCategoria = false,
  submitLabel = 'Guardar',
  submitting = false,
}: ModalGastoProps) {
  const schema = conCategoria ? gastoFormSchema : simpleGastoFormSchema;
  const { data: categorias = [] } = useCategorias(conCategoria);
  const opciones = useMemo(() => {
    const personalizadas = categorias
      .map((c) => c.nombre)
      .filter((nombre) => !GASTO_CATEGORIAS.includes(nombre as (typeof GASTO_CATEGORIAS)[number]));
    return [...GASTO_CATEGORIAS, ...personalizadas];
  }, [categorias]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({});
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onSave(data as GastoFormData);
      reset();
      onClose();
    } catch {
      // La mutación del padre expone el error; mantenemos el modal abierto.
    }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={title} onClose={onClose} />
        <form onSubmit={onSubmit} className="modal__body">
          <FormField label={labelDescripcion} error={(errors as any).descripcion?.message}>
            <Input
              {...register('descripcion')}
              error={!!(errors as any).descripcion}
              placeholder="Nombre"
            />
          </FormField>
          <FormField label="Monto" error={(errors as any).monto?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('monto')}
              error={!!(errors as any).monto}
              placeholder="0"
            />
          </FormField>
          {conCategoria && (
            <FormField label="Categoría" error={(errors as any).categoria?.message}>
              <select className="input" {...register('categoria')}>
                {opciones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          )}
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Guardando...' : submitLabel}
          </Button>
        </form>
      </div>
    </div>
  );
}