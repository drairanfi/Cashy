import type { Usuario } from './index';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Usuario;
  tokens: AuthTokens;
}

export type MeResponse = Usuario & { sueldo: number | null };
