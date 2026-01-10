export const VERIFY_TOKEN_HEADER = 'X-Verify-Token';
export const VERIFY_TOKEN_STORAGE_KEY = 'comment_verify_token';

type JwtPayload = {
  email?: string;
  exp?: number;
  [key: string]: any;
};

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(padded), (c: string) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
  }
  return Buffer.from(padded, 'base64').toString('utf-8');
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getVerifyToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(VERIFY_TOKEN_STORAGE_KEY);
}

export function saveVerifyToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERIFY_TOKEN_STORAGE_KEY, token);
}

export function clearVerifyToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VERIFY_TOKEN_STORAGE_KEY);
}

export function isVerifyTokenValidForEmail(token: string | null, email: string | null | undefined): boolean {
  if (!token || !email) return false;
  const payload = parseJwtPayload(token);
  if (!payload?.email || payload.email !== email) return false;
  if (typeof payload.exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec >= payload.exp) return false;
  }
  return true;
}

