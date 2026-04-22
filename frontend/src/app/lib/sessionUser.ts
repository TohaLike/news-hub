import type { MeResponse } from '@/api/auth';
import type { AccountRole, User } from '../types';
import { buildLetterAvatarDataUrl } from './letterAvatar';

/** Собрать клиентский User из ответа /auth/me. `role` при входе по умолчанию — читатель, пока бэк не отдаёт роль. */
export function userFromMe(
  profile: MeResponse,
  displayName?: string,
  role: AccountRole = 'reader',
): User {
  const email = profile.email;
  const name =
    (displayName?.trim() || email.split('@')[0] || email).trim() || email;
  return {
    name,
    email,
    avatar: buildLetterAvatarDataUrl(name, email),
    role,
  };
}
