import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ahorroFormSchema } from '../../../schemas/movimientos';
import { ModalHeader } from '../../molecules/ModalHeader';
import { FormField } from '../../molecules/FormField';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface ModalAhorroProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string; objetivo: number; actual: number }) => void;
}

export function ModalAhorro({ open, onClose, onSave }: ModalAhorroProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ nombre: string; objetivo: number; actual: number }>({
    resolver: zodResolver(ahorroFormSchema),
    defaultValues: { actual: 0 },
  });

  useEffect(() => {
    if (open) reset({ actual: 0 });
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit((data) => {
    onSave(data as { nombre: string; objetivo: number; actual: number });
    reset();
    onClose();
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Nueva meta de ahorro" onClose={onClose} />
        <form onSubmit={onSubmit} className="modal__body">
          <FormField label="Nombre" error={(errors as any).nombre?.message}>
            <Input
              {...register('nombre')}
              error={!!(errors as any).nombre}
              placeholder="Ej: Viaje a Brasil"
            />
          </FormField>
          <FormField label="Objetivo" error={(errors as any).objetivo?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('objetivo')}
              error={!!(errors as any).objetivo}
              placeholder="0"
            />
          </FormField>
          <FormField label="Ahorrado (opcional)" error={(errors as any).actual?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('actual')}
              error={!!(errors as any).actual}
              placeholder="0"
            />
          </FormField>
          <Button type="submit">Crear meta</Button>
        </form>
      </div>
    </div>
  );
}