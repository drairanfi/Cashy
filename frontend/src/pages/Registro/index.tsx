import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services/api/auth';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { useUserStore } from '@/store/userStore';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

export function Registro() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(null);
      const res = await authApi.register(data);
      setUser(res.user);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  });

  return (
    <AuthLayout title="Crear cuenta" subtitle="Empezá a organizar tus finanzas">
      <form onSubmit={onSubmit} className="auth-form">
        <FormField label="Nombre" error={errors.nombre?.message}>
          <Input {...register('nombre')} error={!!errors.nombre} placeholder="Tu nombre" />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            {...register('email')}
            error={!!errors.email}
            placeholder="tu@email.com"
          />
        </FormField>
        <FormField label="Contraseña" error={errors.password?.message}>
          <Input
            type="password"
            {...register('password')}
            error={!!errors.password}
            placeholder="Mínimo 8 caracteres"
          />
        </FormField>
        {error && <p className="form-field__error">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="auth-form__footer">
        ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
}
