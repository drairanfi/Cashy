import type { Metadata } from 'next';

import { LoginForm } from '@/domains/auth/components/organisms/login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión'
};

export default function LoginPage() {
  return <LoginForm />;
}
