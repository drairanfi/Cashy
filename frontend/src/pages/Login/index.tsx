import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services/api/auth';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useUserStore } from '@/store/userStore';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

export function Login() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(null);
      const res = await authApi.login(data);
      setUser(res.user);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  });

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Bienvenido de nuevo a Cashy">
      <form onSubmit={onSubmit} className="auth-form">
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
            placeholder="••••••••"
          />
        </FormField>
        {error && <p className="form-field__error">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p className="auth-form__footer">
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </AuthLayout>
  );
}
