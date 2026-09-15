import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';
import type { AuthTokens, PublicUser } from '../types/index.js';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData extends Credentials {
  nombre: string;
}

function generateTokens(userId: string): AuthTokens {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  };
}

function toPublicUser(user: { id: string; email: string; nombre: string }): PublicUser {
  return { id: user.id, email: user.email, nombre: user.nombre };
}

export async function registerUseCase(data: RegisterData) {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new HttpError(409, 'El email ya está registrado');
  }

  const hashed = await hashPassword(data.password);
  const user = await userRepository.create({ ...data, password: hashed });

  return { user: toPublicUser(user), tokens: generateTokens(user.id) };
}

export async function loginUseCase(data: Credentials) {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  return { user: toPublicUser(user), tokens: generateTokens(user.id) };
}

export function refreshUseCase(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  return { accessToken: signAccessToken(payload.sub) };
}

export async function getMeUseCase(usuarioId: string) {
  const user = await userRepository.findById(usuarioId);
  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  return {
    ...toPublicUser(user),
    sueldo: user.sueldo ? user.sueldo.monto.toNumber() : null,
  };
}
