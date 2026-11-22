'use client';

import { CheckCircle2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { sendContact, type FormState } from '@/app/actions';
import { FormAlert, Honeypot, SubmitButton, TextArea, TextField } from '../site/Form';

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, action] = useActionState<FormState, FormData>(sendContact, { ok: false });
  const doneRef = useRef<HTMLDivElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.ok) doneRef.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 py-10 outline-none">
        <CheckCircle2 className="h-12 w-12 text-royal" aria-hidden />
        <h3 className="text-2xl font-semibold tracking-tight text-ink">Mensagem enviada.</h3>
        <p className="max-w-md text-tertiary">Obrigado. Respondemos por email ou telefone.</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="relative grid gap-5">
      <Honeypot />
      <FormAlert message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Nome" autoComplete="name" error={e.name} />
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" error={e.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="phone" label="Telefone" type="tel" autoComplete="tel" inputMode="tel" optional error={e.phone} />
        <TextField name="subject" label="Assunto" defaultValue={defaultSubject} optional error={e.subject} />
      </div>
      <TextArea name="message" label="Mensagem" rows={6} error={e.message} />
      <div className="pt-2">
        <SubmitButton>Enviar mensagem</SubmitButton>
      </div>
    </form>
  );
}
