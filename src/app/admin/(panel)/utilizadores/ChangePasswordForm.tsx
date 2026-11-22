'use client';

import { useState } from 'react';
import { changePasswordAction } from '@/app/admin/actions';
import { TextInput, btn, useAction } from '@/components/admin/ui';

export function ChangePasswordForm() {
  const [data, setData] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { pending, call } = useAction();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await call(() => changePasswordAction(data), { refresh: false });
    if (res.ok) {
      setData({ current: '', next: '', confirm: '' });
      setErrors({});
    } else setErrors(res.fields ?? {});
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4">
      <TextInput label="Palavra-passe atual" type="password" value={data.current} onChange={(v) => setData((d) => ({ ...d, current: v }))} error={errors.current} required />
      <TextInput label="Nova palavra-passe" type="password" hint="Mínimo 10 caracteres." value={data.next} onChange={(v) => setData((d) => ({ ...d, next: v }))} error={errors.next} required />
      <TextInput label="Confirmar nova palavra-passe" type="password" value={data.confirm} onChange={(v) => setData((d) => ({ ...d, confirm: v }))} error={errors.confirm} required />
      <button type="submit" disabled={pending} className={`${btn.primary} self-start`}>
        {pending ? 'A alterar…' : 'Alterar palavra-passe'}
      </button>
    </form>
  );
}
