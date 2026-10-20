import type { User } from './user.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface MeResponse extends User {
  sueldo: number | null;
}
