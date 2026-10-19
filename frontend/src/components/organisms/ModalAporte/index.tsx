import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aporteSchema } from '@/schemas/movimientos';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface ModalAporteProps {
  open: boolean;
  nombre: string;
  onClose: () => void;
  onSave: (monto: number) => void | Promise<unknown>;
  submitting?: boolean;
}

export function ModalAporte({ open, nombre, onClose, onSave, submitting = false }: ModalAporteProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(aporteSchema) });

  useEffect(() => {
    if (open) reset({});
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onSave(Number(data.monto));
      reset();
      onClose();
    } catch {
      // La mutación del padre expone el error; mantenemos el modal abierto.
    }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Aportar a meta" onClose={onClose} />
        <p className="confirm-dialog__message">
          El monto se suma al total ya ahorrado de <span className="font-medium text-ink">{nombre}</span>.
        </p>
        <form onSubmit={onSubmit} className="modal__body">
          <FormField label="Monto a aportar" error={(errors as any).monto?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('monto')}
              error={!!(errors as any).monto}
              placeholder="0"
            />
          </FormField>
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Aportando...' : 'Aportar'}
          </Button>
        </form>
      </div>
    </div>
  );
}