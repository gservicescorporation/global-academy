'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '../actions';
import { SubmitButton } from '@/components/site/Form';
import { TextField } from '@/components/site/Form';

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 grid gap-5">
      <input type="hidden" name="next" value={next ?? ''} />
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <TextField name="email" label="Email" type="email" autoComplete="username" inputMode="email" />
      <TextField name="password" label="Palavra-passe" type="password" autoComplete="current-password" />
      <SubmitButton pendingText="A entrar…" className="btn btn-dark justify-center">
        Entrar
      </SubmitButton>
    </form>
  );
}
