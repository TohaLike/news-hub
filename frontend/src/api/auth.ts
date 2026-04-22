import type { AccountRole } from '@/app/types';
import { api } from './client';
import { clearAccessToken, setAccessToken } from './accessMemory';

export type AuthAccess = {
  accessToken: string;
};

export type MeResponse = {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
};

export async function register(params: {
  name: string;
  email: string;
  password: string;
  accountType: AccountRole;
}): Promise<AuthAccess> {
  const { data } = await api.post<AuthAccess>('/auth/register', {
    name: params.name,
    email: params.email,
    password: params.password,
    accountType: params.accountType,
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
