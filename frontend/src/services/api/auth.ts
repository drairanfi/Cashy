import { apiFetch, setTokens } from './client';
import type { AuthResponse, MeResponse } from '@/types/api';

export const authApi = {
  async register(data: { email: string; password: string; nombre: string }) {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res;
  },

  me: () => apiFetch<MeResponse>('/auth/me'),
};
