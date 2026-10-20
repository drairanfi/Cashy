'use client';

import Link from 'next/link';

import { AuthLayout } from '@/components/layout/auth-layout';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useLogin } from '../../hooks/use-login';
import { authMessages } from '../../messages';

export function LoginForm() {
  const { register, onSubmit, errors, isSubmitting } = useLogin();

  return (
    <AuthLayout
      title={authMessages.login.title}
      subtitle={authMessages.login.subtitle}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={authMessages.login.emailLabel} error={errors.email?.message}>
          <Input
            type="email"
            placeholder={authMessages.login.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>
        <FormField
          label={authMessages.login.passwordLabel}
          error={errors.password?.message}
        >
          <Input
            type="password"
            placeholder={authMessages.login.passwordPlaceholder}
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? authMessages.login.submitting : authMessages.login.submit}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {authMessages.login.footerQuestion}{' '}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          {authMessages.login.footerLink}
        </Link>
      </p>
    </AuthLayout>
  );
}
