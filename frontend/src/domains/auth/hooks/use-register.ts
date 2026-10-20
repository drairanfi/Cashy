'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useSessionStore } from '@/store/session.store';

import { authApi } from '../api';
import { registerSchema, type RegisterInput } from '../register.schema';

export function useRegister() {
  const router = useRouter();
  const setSession = useSessionStore(state => state.setSession);
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = form.handleSubmit(async values => {
    try {
      const { user, tokens } = await authApi.register(values);
      setSession(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/');
    } catch (error) {
      form.setError('root', { message: (error as Error).message });
    }
  });

  return {
    register: form.register,
    onSubmit,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting
  };
}
