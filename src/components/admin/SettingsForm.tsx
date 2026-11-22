'use client';

import { useState } from 'react';
import { saveSettingsAction } from '@/app/admin/actions';
import type { SettingDef } from '@/lib/settings-defs';
import { ImageField, ImageListField } from './media';
import { Card, TextArea, TextInput, btn, useAction, useUnsavedWarning } from './ui';

export function SettingsForm({ defs, values }: { defs: SettingDef[]; values: Record<string, string> }) {
  const [data, setData] = useState(values);
  const [initial] = useState(values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { pending, call } = useAction();
  const dirty = JSON.stringify(data) !== JSON.stringify(initial);
  useUnsavedWarning(dirty);
  const groups = [...new Set(defs.map((d) => d.group))];

  const set = (name: string, v: string) => setData((d) => ({ ...d, [name]: v }));
  const lines = (v: string) => v.split('\n').filter(Boolean);

  async function onSave() {
    const res = await call(() => saveSettingsAction(data), { success: 'Conteúdo guardado.', refresh: false });
    setErrors(res.ok ? {} : (res.fields ?? {}));
  }

  return (
    <div className="grid gap-6 pb-24">
      {dirty && <div role="status" className="sticky top-[88px] z-20 rounded-2xl bg-gold-soft px-4 py-2.5 text-sm font-medium text-ink shadow-sm">Tem alterações por guardar.</div>}
      {groups.map((g) => (
        <Card key={g} title={g}>
          {defs
            .filter((d) => d.group === g)
            .map((d) =>
              d.type === 'image' ? (
                <ImageField key={d.name} label={d.label} hint={d.help} error={errors[d.name]} value={data[d.name] ?? ''} onChange={(v) => set(d.name, v)} />
              ) : d.type === 'gallery' ? (
                <ImageListField key={d.name} label={d.label} hint={d.help} value={lines(data[d.name] ?? '')} onChange={(v) => set(d.name, v.join('\n'))} />
              ) : d.type === 'textarea' ? (
                <TextArea key={d.name} label={d.label} hint={d.help} error={errors[d.name]} rows={d.rows} value={data[d.name] ?? ''} onChange={(v) => set(d.name, v)} />
              ) : (
                <TextInput key={d.name} label={d.label} hint={d.help} error={errors[d.name]} value={data[d.name] ?? ''} onChange={(v) => set(d.name, v)} />
              )
            )}
        </Card>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur-xl lg:left-[272px] lg:px-8">
        <button type="button" onClick={onSave} disabled={pending} className={btn.primary}>
          {pending ? 'A guardar…' : 'Guardar tudo'}
        </button>
      </div>
    </div>
  );
}
