import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { upsertSueldoSchema, type UpsertSueldoInput } from '@/schemas/sueldo';
import { useUpsertSueldo } from '@/hooks/useSueldo';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface ModalConfigurarSueldoProps {
  open: boolean;
  onClose: () => void;
  currentMonto?: number;
}

export function ModalConfigurarSueldo({ open, onClose, currentMonto }: ModalConfigurarSueldoProps) {
  const upsertSueldo = useUpsertSueldo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpsertSueldoInput>({ resolver: zodResolver(upsertSueldoSchema) });

  useEffect(() => {
    if (open) {
      reset(currentMonto !== undefined ? { monto: currentMonto } : {});
    }
  }, [open, currentMonto, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (data) => {
    await upsertSueldo.mutateAsync(data.monto);
    reset();
    onClose();
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Configurar sueldo" onClose={onClose} />
        <form onSubmit={onSubmit} className="modal__body">
          <FormField label="Sueldo mensual" error={errors.monto?.message}>
            <Input
              type="number"
              step="0.01"
              {...register('monto', { valueAsNumber: true })}
              error={!!errors.monto}
              placeholder="0"
            />
          </FormField>
          {upsertSueldo.isError && (
            <p className="form-field__error">{(upsertSueldo.error as Error).message}</p>
          )}
          <Button type="submit" disabled={upsertSueldo.isPending} aria-busy={upsertSueldo.isPending}>
            {upsertSueldo.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
