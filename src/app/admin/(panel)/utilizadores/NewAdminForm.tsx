'use client';

import { useState } from 'react';
import { createAdminAction } from '@/app/admin/actions';
import { TextInput, btn, useAction } from '@/components/admin/ui';

export function NewAdminForm() {
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { pending, call } = useAction();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await call(() => createAdminAction(data), { refresh: false });
    if (res.ok) {
      setData({ name: '', email: '', password: '' });
      setErrors({});
    } else setErrors(res.fields ?? {});
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4">
      <TextInput label="Nome" value={data.name} onChange={(v) => setData((d) => ({ ...d, name: v }))} error={errors.name} required />
      <TextInput label="Email" type="email" value={data.email} onChange={(v) => setData((d) => ({ ...d, email: v }))} error={errors.email} required />
      <TextInput label="Palavra-passe" type="password" hint="Mínimo 10 caracteres." value={data.password} onChange={(v) => setData((d) => ({ ...d, password: v }))} error={errors.password} required />
      <button type="submit" disabled={pending} className={`${btn.primary} self-start`}>
        {pending ? 'A adicionar…' : 'Adicionar'}
      </button>
    </form>
  );
}
