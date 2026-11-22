import { getSession } from '@/lib/auth';

export type Result<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string; fields?: Record<string, string> };

export class AuthError extends Error {
  constructor() {
    super('Sessão expirada. Entre novamente.');
  }
}

/** Verificação de sessão em cada serviço (além do proxy). */
export async function assertAdmin() {
  const s = await getSession();
  if (!s) throw new AuthError();
  return s;
}

export class InputError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

/** Corre um serviço e converte erros conhecidos num Result (para server actions e API). */
export async function run<T>(fn: () => Promise<T>, message?: string): Promise<Result<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    if (e instanceof InputError) return { ok: false, error: e.message, fields: e.fields };
    console.error('[admin]', e);
    return { ok: false, error: 'Ocorreu um erro inesperado. Tente novamente.' };
  }
}

export function zodFields(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const k = i.path.map(String).join('.');
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
