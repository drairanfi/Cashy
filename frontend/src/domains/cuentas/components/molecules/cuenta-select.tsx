'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { FormField } from '@/components/molecules/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { useCuentas } from '../../hooks/use-cuentas';
import { cuentasMessages } from '../../messages';

export const SIN_CUENTA = 'none';

interface CuentaSelectProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export function CuentaSelect({ value, onChange, error, disabled }: CuentaSelectProps) {
  const { data: cuentas = [] } = useCuentas();

  return (
    <FormField label={cuentasMessages.selector.label} error={error}>
      <Select
        value={value ?? SIN_CUENTA}
        onValueChange={next => onChange(next === SIN_CUENTA ? null : next)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={cuentasMessages.selector.none} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SIN_CUENTA}>{cuentasMessages.selector.none}</SelectItem>
          {cuentas.map(cuenta => (
            <SelectItem key={cuenta.id} value={cuenta.id}>
              {cuenta.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

interface CuentaSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
}

export function CuentaSelectField<T extends FieldValues>({
  control,
  name,
  disabled
}: CuentaSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <CuentaSelect
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          disabled={disabled}
        />
      )}
    />
  );
}
