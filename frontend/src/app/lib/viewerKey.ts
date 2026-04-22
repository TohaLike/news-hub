const STORAGE_KEY = 'nh:viewerKey';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidViewerKey(s: string): boolean {
  return UUID_V4.test(s.trim());
}

/** Стабильный ключ браузера для учёта одного просмотра на гостя (без регистрации). */
export function getOrCreateViewerKey(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && isValidViewerKey(existing)) {
      return existing.trim().toLowerCase();
    }
    const created = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, created);
    return created.toLowerCase();
  } catch {
    return '';
  }
}
