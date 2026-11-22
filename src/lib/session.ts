import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'ga_admin';

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET em falta ou demasiado curto');
    return new TextEncoder().encode('dev-only-secret-change-me-please-0123456789');
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload: { uid: string; email: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(key());
}

export async function verifySession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as { uid: string; email: string };
  } catch {
    return null;
  }
}
