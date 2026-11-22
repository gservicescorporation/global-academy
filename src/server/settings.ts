import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { SETTINGS } from '@/lib/settings-defs';
import { assertAdmin, InputError } from './guard';

const SAFE_URL = /^(https?:\/\/|\/)[^\s<>"']*$/i;

/** Grava as definições do site (só chaves conhecidas). */
export async function saveSettings(values: Record<string, unknown>) {
  await assertAdmin();
  const errors: Record<string, string> = {};
  const rows: { key: string; value: string }[] = [];
  for (const d of SETTINGS) {
    if (!(d.name in values)) continue;
    const raw = values[d.name];
    const v = Array.isArray(raw) ? raw.map(String).join('\n') : String(raw ?? '').trim();
    if (v.length > 8000) errors[d.name] = 'Texto demasiado longo.';
    if (v && (d.type === 'image' || d.name.startsWith('social_')) && !SAFE_URL.test(v)) errors[d.name] = 'Use um endereço que comece por https:// ou /.';
    if (d.type === 'gallery' && v.split('\n').some((u) => u && !SAFE_URL.test(u.trim()))) errors[d.name] = 'Há ligações inválidas na galeria.';
    rows.push({ key: d.name, value: v });
  }
  if (Object.keys(errors).length) throw new InputError('Verifique os campos assinalados.', errors);
  const ds = await getDb();
  await ds.getRepository('Setting').save(rows);
  revalidatePath('/', 'layout');
}
