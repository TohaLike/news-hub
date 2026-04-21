/** Access JWT только в памяти вкладки (после F5 восстанавливается через POST /auth/refresh + HttpOnly cookie). */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
