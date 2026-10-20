import { apiConfig } from '@/config/site';
import { useSessionStore } from '@/store/session.store';

const API_URL = apiConfig.baseUrl;

export function hasSession(): boolean {
  return Boolean(useSessionStore.getState().accessToken);
}

export function clearSession(): void {
  useSessionStore.getState().clearSession();
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useSessionStore.getState();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { accessToken: string };
  useSessionStore.getState().setTokens(data.accessToken, refreshToken);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

  let response = await makeRequest(useSessionStore.getState().accessToken);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      clearSession();
      throw new Error('Sesión expirada');
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    const message =
      typeof body?.error === 'string' ? body.error : `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
