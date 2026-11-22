import { getDb } from './db';
import type { Field } from './fields';

export type RelOptions = Record<string, { value: string; label: string }[]>;

/** Carrega as opções dos campos de relação (ex.: lista de cursos para uma edição). */
export async function loadRelationOptions(fields: Field[]): Promise<RelOptions> {
  const ds = await getDb();
  const out: RelOptions = {};
  for (const f of fields) {
    if ((f.type !== 'relation' && f.type !== 'multirelation') || !f.relation) continue;
    const rows = (await ds.getRepository(f.relation.entity).find()) as Record<string, unknown>[];
    out[f.name] = rows.map((r) => ({ value: r.id as string, label: String(r[f.relation!.labelField]) }));
  }
  return out;
}
