import type { Metadata } from 'next';

import { RegisterForm } from '@/domains/auth/components/organisms/register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta'
};

export default function RegisterPage() {
  return <RegisterForm />;
}
