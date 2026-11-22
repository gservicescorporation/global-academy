import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE, verifySession } from './session';

export async function getSession() {
  const c = await cookies();
  return verifySession(c.get(COOKIE)?.value);
}

/** Usar no início de cada página/ação do painel. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return s;
}
