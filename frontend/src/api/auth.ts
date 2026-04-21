import { api } from './client';
import { clearAccessToken, setAccessToken } from './accessMemory';

export type AuthAccess = {
  accessToken: string;
};

export type MeResponse = {
  id: string;
  email: string;
};

export async function register(
  email: string,
  password: string,
): Promise<AuthAccess> {
  const { data } = await api.post<AuthAccess>('/auth/register', {
    email,
    password,
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function login(email: string, password: string): Promise<AuthAccess> {
  const { data } = await api.post<AuthAccess>('/auth/login', {
    email,
    password,
  });
  setAccessToken(data.accessToken);
  return data;
}

/** Новый access; refresh в HttpOnly-cookie ротация на сервере. */
export async function refreshSession(): Promise<AuthAccess> {
  const { data } = await api.post<AuthAccess>('/auth/refresh');
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const { data } = await api.post<{ success: boolean }>('/auth/logout');
    clearAccessToken();
    return data;
  } catch {
    clearAccessToken();
    throw new Error('Logout failed');
  }
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}
