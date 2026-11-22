import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import type { Field } from '@/lib/fields';
import { resources, type Resource } from '@/lib/resources';
import { assertAdmin, InputError } from './guard';

export function resourceOrThrow(key: string): Resource {
  const r = resources[key];
  if (!r) throw new InputError('Recurso desconhecido.');
  return r;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_URL = /^(https?:\/\/|\/)[^\s<>"']*$/i;

/** Valida e normaliza um registo a partir da definição de campos do recurso. */
function clean(fields: Field[], input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = input[f.name];
    switch (f.type) {
      case 'boolean':
        data[f.name] = raw === true || raw === 'true' || raw === 'on';
        break;
      case 'number': {
        if (raw === '' || raw === null || raw === undefined) {
          if (f.required) errors[f.name] = 'Campo obrigatório.';
          data[f.name] = f.default ?? 0;
          break;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) errors[f.name] = 'Número inválido.';
        else data[f.name] = n;
        break;
      }
      case 'multirelation': {
        const ids = Array.isArray(raw) ? raw.map(String).filter((v) => UUID.test(v)) : [];
        data[f.name] = ids.length ? ids : null;
        break;
      }
      case 'select': {
        const v = String(raw ?? '').trim();
        if (v && f.options && !f.options.some((o) => o.value === v)) errors[f.name] = 'Opção inválida.';
        else if (!v && f.required) errors[f.name] = 'Escolha uma opção.';
        data[f.name] = v || null;
        break;
      }
      default: {
        const v = typeof raw === 'string' ? raw.trim() : '';
        if (f.required && !v) errors[f.name] = 'Campo obrigatório.';
        if (v.length > 8000) errors[f.name] = 'Texto demasiado longo.';
        if (v && (f.type === 'image' || f.name.toLowerCase().endsWith('url') || f.name === 'link') && !SAFE_URL.test(v)) {
          errors[f.name] = 'Use um endereço que comece por https:// ou /.';
        }
        data[f.name] = v === '' ? null : v;
      }
    }
  }
  if (Object.keys(errors).length) throw new InputError('Verifique os campos assinalados.', errors);
  return data;
}

export async function listResource(key: string) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  const ds = await getDb();
  return (await ds.getRepository(r.entity).find({ order: r.order })) as Record<string, unknown>[];
}

export async function getResource(key: string, id: string) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  if (!UUID.test(id)) return null;
  const ds = await getDb();
  return (await ds.getRepository(r.entity).findOne({ where: { id } })) as Record<string, unknown> | null;
}

export async function saveResource(key: string, id: string | null, input: Record<string, unknown>) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  if (id && !UUID.test(id)) throw new InputError('Registo inválido.');
  const data = clean(r.fields, input);
  const ds = await getDb();
  const repo = ds.getRepository(r.entity);
  if (id && !(await repo.findOne({ where: { id } }))) throw new InputError('Este registo já não existe.');
  const saved = (await repo.save(id ? { id, ...data } : data)) as { id: string };
  revalidatePath('/', 'layout');
  return { id: saved.id };
}

export async function deleteResource(key: string, id: string) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  if (!UUID.test(id)) throw new InputError('Registo inválido.');
  const ds = await getDb();
  if (r.entity === 'PaymentMethod') {
    const [{ n }] = (await ds.query(`SELECT COUNT(*)::int AS n FROM enrollments WHERE payment_method_id = $1`, [id])) as { n: number }[];
    if (Number(n) > 0) throw new InputError('Este método já foi usado em inscrições. Desative-o em vez de o apagar.');
  }
  await ds.getRepository(r.entity).delete(id);
  revalidatePath('/', 'layout');
}

/** Grava a nova ordem (campo position) a partir da lista de ids. */
export async function reorderResource(key: string, ids: string[]) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  if (!r.fields.some((f) => f.name === 'position')) throw new InputError('Este recurso não tem ordem.');
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((v) => UUID.test(v))) throw new InputError('Ordem inválida.');
  const ds = await getDb();
  await ds.transaction(async (m) => {
    for (const [i, id] of ids.entries()) await m.getRepository(r.entity).update(id, { position: i + 1 });
  });
  revalidatePath('/', 'layout');
}

export async function toggleResource(key: string, id: string, field: string) {
  await assertAdmin();
  const r = resourceOrThrow(key);
  const f = r.fields.find((x) => x.name === field);
  if (!f || f.type !== 'boolean' || !UUID.test(id)) throw new InputError('Campo inválido.');
  const ds = await getDb();
  const repo = ds.getRepository(r.entity);
  const row = (await repo.findOne({ where: { id } })) as Record<string, unknown> | null;
  if (!row) throw new InputError('Registo não encontrado.');
  await repo.update(id, { [field]: !row[field] });
  revalidatePath('/', 'layout');
  return !row[field];
}

/** Opções para campos de relação (ex.: formadores de um curso). */
export async function relationOptions(entity: string, labelField: string) {
  await assertAdmin();
  const ds = await getDb();
  const rows = (await ds.getRepository(entity).find()) as Record<string, unknown>[];
  return rows.map((r) => ({ value: String(r.id), label: String(r[labelField] ?? '') }));
}
