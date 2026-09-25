import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gastoFormSchema, simpleGastoFormSchema } from '../../../schemas/movimientos';
import { GASTO_CATEGORIAS, type GastoCategoria } from '../../../types';
import { ModalHeader } from '../../molecules/ModalHeader';
import { FormField } from '../../molecules/FormField';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

export interface GastoFormData {
  descripcion: string;
  monto: number;
  categoria?: GastoCategoria;
}

interface ModalGastoProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: GastoFormData) => void;
  title: string;
  labelDescripcion?: string;
  conCategoria?: boolean;
  submitLabel?: string;
}

export function ModalGasto({
  open,
  onClose,
  onSave,
  title,
  labelDescripcion = 'Descripción',
  conCategoria = false,
  submitLabel = 'Guardar',
}: ModalGastoProps) {
  const schema = conCategoria ? gastoFormSchema : simpleGastoFormSchema;
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

  const onSubmit = handleSubmit((data) => {
    onSave(data as GastoFormData);
    reset();
    onClose();
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
                {GASTO_CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          )}
          <Button type="submit">{submitLabel}</Button>
        </form>
      </div>
    </div>
  );
}