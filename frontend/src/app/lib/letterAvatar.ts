/** Стабильные цвета фона аватара по email (цвет «сохранён» в строке data URL). */
const AVATAR_COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#A21CAF',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#65A30D',
  '#16A34A',
  '#0D9488',
  '#0891B2',
  '#2563EB',
] as const;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Цвет фона по произвольной строке (id, email и т.д.) — одинаково для одного и того же seed. */
export function avatarBackgroundFromSeed(seed: string): string {
  const ix = hashSeed(seed.toLowerCase()) % AVATAR_COLORS.length;
  return AVATAR_COLORS[ix];
}

/** @deprecated используйте avatarBackgroundFromSeed */
export function avatarBackgroundFromEmail(email: string): string {
  return avatarBackgroundFromSeed(email);
}

function firstDisplayLetter(name: string, email: string): string {
  const trimmedName = name.trim();
  if (trimmedName.length > 0) {
    const ch = [...trimmedName][0] ?? '?';
    return ch.toLocaleUpperCase('ru-RU');
  }
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 0) {
    const ch = [...trimmedEmail][0] ?? '?';
    return ch.toLocaleUpperCase('en-US');
  }
  return '?';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Data URL SVG: первая буква имени, фон из палитры по строке-seed (email, id и т.д.). */
export function buildLetterAvatarDataUrl(name: string, colorSeed: string): string {
  const letter = escapeXml(firstDisplayLetter(name, colorSeed));
  const fill = avatarBackgroundFromSeed(colorSeed);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="Avatar">
  <rect width="128" height="128" fill="${fill}" rx="64"/>
  <text x="64" y="64" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="56" font-weight="600">${letter}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const CUSTOM_AVATAR_PREFIXES = ['http://', 'https://', 'data:'] as const;

function isCustomAvatarUrl(value: string): boolean {
  const v = value.trim();
  return CUSTOM_AVATAR_PREFIXES.some((p) => v.startsWith(p));
}

/** Сторонние «сгенерированные» аватары (две буквы и др.) — не считаем своими, рисуем наш SVG. */
function isRemoteGeneratedAvatarUrl(value: string): boolean {
  try {
    const host = new URL(value.trim()).hostname.toLowerCase();
    return (
      host === 'ui-avatars.com' ||
      host.endsWith('.ui-avatars.com') ||
      host === 'www.gravatar.com' ||
      host === 'gravatar.com' ||
      host === 'api.dicebear.com'
    );
  } catch {
    return false;
  }
}

/**
 * Единый аватар: только свой URL/файл или наш круг с одной буквой.
 * `colorSeed` — стабильный id пользователя (один цвет везде); иначе email и т.п.
 */
export function personAvatarUrl(
  displayName: string,
  colorSeed: string,
  storedAvatar?: string | null,
): string {
  const custom = storedAvatar?.trim();
  if (
    custom &&
    isCustomAvatarUrl(custom) &&
    !isRemoteGeneratedAvatarUrl(custom)
  ) {
    return custom;
  }
  const seed = (colorSeed || displayName || '?').trim() || '?';
  const name = (displayName || '?').trim() || '?';
  return buildLetterAvatarDataUrl(name, seed);
}
