'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteResourceAction, saveResourceAction } from '@/app/admin/actions';
import type { Field } from '@/lib/fields';
import { ImageField } from './media';
import { Select, TextArea, TextInput, Toggle, btn, useAction, useUnsavedWarning } from './ui';

type RelOptions = Record<string, { value: string; label: string }[] | undefined>;
type Value = string | number | boolean | string[];

function initialState(fields: Field[], record: Record<string, unknown> | null): Record<string, Value> {
  const out: Record<string, Value> = {};
  for (const f of fields) {
    const raw = record?.[f.name];
    if (f.type === 'boolean') out[f.name] = raw !== undefined ? Boolean(raw) : Boolean(f.default ?? false);
    else if (f.type === 'multirelation') out[f.name] = Array.isArray(raw) ? (raw as string[]) : [];
    else if (f.type === 'number') out[f.name] = raw !== undefined && raw !== null ? Number(raw) : Number(f.default ?? 0);
    else out[f.name] = raw !== undefined && raw !== null ? String(raw) : String(f.default ?? '');
  }
  return out;
}

export function ResourceForm({
  resourceKey,
  id,
  fields,
  record,
  relOptions,
  singular,
  listHref,
}: {
  resourceKey: string;
  id: string | null;
  fields: Field[];
  record: Record<string, unknown> | null;
  relOptions: RelOptions;
  singular: string;
  listHref: string;
}) {
  const router = useRouter();
  const [data, setData] = useState(() => initialState(fields, record));
  const [initial] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { pending, call } = useAction();
  const [deleting, setDeleting] = useState(false);
  const dirty = JSON.stringify(data) !== JSON.stringify(initial);
  useUnsavedWarning(dirty);

  const set = <K extends string>(name: K, value: Value) => setData((d) => ({ ...d, [name]: value }));

  async function onSave() {
    const res = await call(() => saveResourceAction(resourceKey, id, data), { success: `${singular[0].toUpperCase()}${singular.slice(1)} guardado.`, refresh: false });
    if (res.ok) {
      setErrors({});
      router.push(listHref);
    } else {
      setErrors(res.fields ?? {});
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!window.confirm(`Tem a certeza que quer apagar este ${singular}?`)) return;
    setDeleting(true);
    const res = await call(() => deleteResourceAction(resourceKey, id), { refresh: false });
    setDeleting(false);
    if (res.ok) router.push(listHref);
  }

  return (
    <div className="grid gap-6 pb-24">
      {dirty && (
        <div role="status" className="sticky top-[88px] z-20 flex items-center gap-2 rounded-2xl bg-gold-soft px-4 py-2.5 text-sm font-medium text-ink shadow-sm">
          Tem alterações por guardar.
        </div>
      )}
      <div className="grid gap-5">
        {fields.map((f) => {
          const err = errors[f.name];
          if (f.type === 'boolean') return <Toggle key={f.name} label={f.label} hint={f.help} checked={Boolean(data[f.name])} onChange={(v) => set(f.name, v)} />;
          if (f.type === 'image')
            return <ImageField key={f.name} label={f.label} hint={f.help} error={err} required={f.required} value={String(data[f.name] ?? '')} onChange={(v) => set(f.name, v)} />;
          if (f.type === 'textarea') return <TextArea key={f.name} label={f.label} hint={f.help} error={err} required={f.required} rows={f.rows} value={String(data[f.name] ?? '')} onChange={(v) => set(f.name, v)} />;
          if (f.type === 'number')
            return (
              <TextInput key={f.name} label={f.label} hint={f.help} error={err} required={f.required} type="number" step="any" value={data[f.name] as number} onChange={(v) => set(f.name, Number(v))} />
            );
          if (f.type === 'select' || f.type === 'relation')
            return (
              <Select
                key={f.name}
                label={f.label}
                hint={f.help}
                error={err}
                required={f.required}
                value={String(data[f.name] ?? '')}
                onChange={(v) => set(f.name, v)}
                options={f.type === 'select' ? (f.options ?? []) : (relOptions[f.name] ?? [])}
                placeholder={f.required ? undefined : '—'}
              />
            );
          if (f.type === 'multirelation') {
            const selected = data[f.name] as string[];
            const opts = relOptions[f.name] ?? [];
            return (
              <div key={f.name} className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">{f.label}</span>
                {opts.length === 0 ? (
                  <p className="text-tertiary">Adicione formadores primeiro.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {opts.map((o) => (
                      <label key={o.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-2.5 has-checked:border-royal has-checked:bg-royal/5">
                        <input
                          type="checkbox"
                          checked={selected.includes(o.value)}
                          onChange={(e) => set(f.name, e.target.checked ? [...selected, o.value] : selected.filter((v) => v !== o.value))}
                          className="h-4 w-4 accent-royal"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                )}
                {f.help && <span className="text-xs text-tertiary">{f.help}</span>}
              </div>
            );
          }
          return (
            <TextInput key={f.name} label={f.label} hint={f.help} error={err} required={f.required} type={f.type === 'date' ? 'date' : 'text'} value={String(data[f.name] ?? '')} onChange={(v) => set(f.name, v)} />
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur-xl lg:left-[272px] lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <button type="button" onClick={onSave} disabled={pending} className={btn.primary}>
              {pending ? 'A guardar…' : 'Guardar'}
            </button>
            <button type="button" onClick={() => router.push(listHref)} className={btn.secondary}>
              Cancelar
            </button>
          </div>
          {id && (
            <button type="button" onClick={onDelete} disabled={deleting} className={btn.danger}>
              {deleting ? 'A apagar…' : `Apagar ${singular}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
