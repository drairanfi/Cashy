const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const ACCESS_KEY = 'cashy_access_token';
const REFRESH_KEY = 'cashy_refresh_token';

let accessToken: string | null = localStorage.getItem(ACCESS_KEY);
let refreshToken: string | null = localStorage.getItem(REFRESH_KEY);

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function hasSession(): boolean {
  return Boolean(accessToken);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { accessToken: string };
  accessToken = data.accessToken;
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = (token?: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(accessToken);

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Error ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
