import { randomBytes } from 'crypto';
import path from 'path';

export { COURSE_STATUS, formatPrice, formatRange, lines } from './format';

export function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'curso';
}

export function uploadDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || './uploads');
}

export function genReference() {
  return 'ATL-' + randomBytes(4).toString('hex').toUpperCase();
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** URL absoluto a partir de SITE_URL (links externos ficam como estão). */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Perguntas frequentes no formato do painel: blocos separados por linha em branco; 1.ª linha = pergunta. */
export function parseFaq(value?: string | null): { q: string; a: string }[] {
  return (value ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))
    .filter((l) => l.length >= 2)
    .map(([q, ...a]) => ({ q, a: a.join('\n') }));
}
