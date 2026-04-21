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

export function avatarBackgroundFromEmail(email: string): string {
  const ix = hashSeed(email.toLowerCase()) % AVATAR_COLORS.length;
  return AVATAR_COLORS[ix];
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

/** Data URL SVG: первая буква имени, фон из палитры по email. */
export function buildLetterAvatarDataUrl(name: string, email: string): string {
  const letter = escapeXml(firstDisplayLetter(name, email));
  const fill = avatarBackgroundFromEmail(email);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="Avatar">
  <rect width="128" height="128" fill="${fill}" rx="64"/>
  <text x="64" y="64" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="56" font-weight="600">${letter}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
