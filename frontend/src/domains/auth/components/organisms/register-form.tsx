'use client';

import Link from 'next/link';

import { AuthLayout } from '@/components/layout/auth-layout';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useRegister } from '../../hooks/use-register';
import { authMessages } from '../../messages';

export function RegisterForm() {
  const { register, onSubmit, errors, isSubmitting } = useRegister();

  return (
    <AuthLayout
      title={authMessages.register.title}
      subtitle={authMessages.register.subtitle}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label={authMessages.register.nameLabel} error={errors.nombre?.message}>
          <Input
            placeholder={authMessages.register.namePlaceholder}
            aria-invalid={Boolean(errors.nombre)}
            {...register('nombre')}
          />
        </FormField>
        <FormField label={authMessages.register.emailLabel} error={errors.email?.message}>
          <Input
            type="email"
            placeholder={authMessages.register.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>
        <FormField
          label={authMessages.register.passwordLabel}
          error={errors.password?.message}
        >
          <Input
            type="password"
            placeholder={authMessages.register.passwordPlaceholder}
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? authMessages.register.submitting : authMessages.register.submit}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {authMessages.register.footerQuestion}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {authMessages.register.footerLink}
        </Link>
      </p>
    </AuthLayout>
  );
}
