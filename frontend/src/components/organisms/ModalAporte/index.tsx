import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aporteSchema } from '../../../schemas/mock';
import { ModalHeader } from '../../molecules/ModalHeader';
import { FormField } from '../../molecules/FormField';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface ModalAporteProps {
  open: boolean;
  nombre: string;
  onClose: () => void;
  onSave: (monto: number) => void;
}

export function ModalAporte({ open, nombre, onClose, onSave }: ModalAporteProps) {
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

  const onSubmit = handleSubmit((data) => {
    onSave(Number(data.monto));
    reset();
    onClose();
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Aportar a meta" onClose={onClose} />
        <p className="confirm-dialog__message">
          El monto se suma al total ya ahorrado de <span className="font-medium text-white">{nombre}</span>.
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
          <Button type="submit">Aportar</Button>
        </form>
      </div>
    </div>
  );
}