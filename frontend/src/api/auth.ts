import { api } from './client';
import { clearTokens, getRefreshToken, setTokens } from './tokenStorage';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = {
  id: string;
  email: string;
};

export async function register(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/register', {
    email,
    password,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/login', {
    email,
    password,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/** Обновить пару токенов (ротация refresh на бэке). */
export async function refreshSession(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  const { data } = await api.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<{ success: boolean }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return { success: true };
  }
  try {
    const { data } = await api.post<{ success: boolean }>('/auth/logout', {
      refreshToken,
    });
    clearTokens();
    return data;
  } catch {
    clearTokens();
    throw new Error('Logout failed');
  }
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}
