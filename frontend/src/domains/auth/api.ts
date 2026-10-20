import { apiFetch } from '@/lib/api/client';
import type { AuthResponse, MeResponse } from '@/types/auth.types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  nombre: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  me: () => apiFetch<MeResponse>('/auth/me')
};
