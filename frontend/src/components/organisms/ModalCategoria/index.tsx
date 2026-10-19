import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoriaFormSchema, type CategoriaFormInput } from '@/schemas/categorias';
import { ModalHeader } from '@/components/molecules/ModalHeader';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface ModalCategoriaProps {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string) => void;
  error?: string | null;
  submitting?: boolean;
}

export function ModalCategoria({ open, onClose, onSave, error, submitting = false }: ModalCategoriaProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormInput>({ resolver: zodResolver(categoriaFormSchema) });

  useEffect(() => {
    if (open) reset({ nombre: '' });
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit((data) => {
    onSave(data.nombre);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Nueva categoría" onClose={onClose} />
        <form onSubmit={onSubmit} className="modal__body">
          <FormField label="Nombre" error={errors.nombre?.message}>
            <Input
              {...register('nombre')}
              error={!!errors.nombre}
              placeholder="Ej: Mascotas"
              autoFocus
            />
          </FormField>
          {error && <p className="form-field__error">{error}</p>}
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Guardando...' : 'Guardar categoría'}
          </Button>
        </form>
      </div>
    </div>
  );
}
