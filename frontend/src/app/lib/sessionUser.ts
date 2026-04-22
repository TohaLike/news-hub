import type { MeResponse } from '@/api/auth';
import type { AccountRole, User } from '../types';
import { buildLetterAvatarDataUrl } from './letterAvatar';

/** Собрать клиентский User из ответа /auth/me. */
export function userFromMe(profile: MeResponse): User {
  const email = profile.email;
  const name =
    (profile.name?.trim() || email.split('@')[0] || email).trim() || email;
  const role: AccountRole =
    profile.role === 'publisher' ? 'publisher' : 'reader';
  return {
    id: profile.id,
    name,
    email,
    avatar: buildLetterAvatarDataUrl(name, email),
    role,
  };
}
