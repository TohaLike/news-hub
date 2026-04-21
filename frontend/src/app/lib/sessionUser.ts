import type { MeResponse } from '@/api/auth';
import type { User } from '../types';
import { buildLetterAvatarDataUrl } from './letterAvatar';

/** Собрать клиентский User из ответа /auth/me (имя с бэка нет — берём часть email или override). */
export function userFromMe(profile: MeResponse, displayName?: string): User {
  const email = profile.email;
  const name =
    (displayName?.trim() || email.split('@')[0] || email).trim() || email;
  return {
    name,
    email,
    avatar: buildLetterAvatarDataUrl(name, email),
  };
}
