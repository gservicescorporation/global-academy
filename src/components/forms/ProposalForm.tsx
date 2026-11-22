'use client';

import { CheckCircle2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { requestProposal, type FormState } from '@/app/actions';
import { FormAlert, Honeypot, SelectField, SubmitButton, TextArea, TextField } from '../site/Form';

const FORMATS = [
  { value: 'presencial-empresa', label: 'Presencial, nas nossas instalações' },
  { value: 'presencial-academia', label: 'Presencial, num espaço da academia' },
  { value: 'online', label: 'Online' },
  { value: 'indiferente', label: 'Ainda não sei' },
];

export function ProposalForm({ topics }: { topics: string[] }) {
  const [state, action] = useActionState<FormState, FormData>(requestProposal, { ok: false });
  const doneRef = useRef<HTMLDivElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.ok) doneRef.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 py-10 outline-none">
        <CheckCircle2 className="h-12 w-12 text-royal" aria-hidden />
        <h3 className="text-2xl font-semibold tracking-tight text-ink">Pedido recebido.</h3>
        <p className="max-w-md text-tertiary">
          Vamos analisar o que nos enviou e responder por email com uma proposta: programa, duração, formato e orçamento.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="relative grid gap-5">
      <Honeypot />
      <FormAlert message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="company" label="Empresa" autoComplete="organization" error={e.company} />
        <TextField name="participants" label="Número de participantes" type="number" inputMode="numeric" min={1} max={1000} error={e.participants} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="O seu nome" autoComplete="name" error={e.name} />
        <TextField name="role" label="Função" autoComplete="organization-title" optional error={e.role} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" error={e.email} />
        <TextField name="phone" label="Telefone" type="tel" autoComplete="tel" inputMode="tel" error={e.phone} />
      </div>
      <TextField
        name="topic"
        label="Tema ou curso"
        error={e.topic}
        hint={topics.length ? `Por exemplo: ${topics.slice(0, 3).join(', ')}` : 'Por exemplo: gestão de sinistros, liderança de equipas'}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="format" label="Formato" options={FORMATS} error={e.format} />
        <TextField name="timeframe" label="Para quando?" placeholder="Ex.: março de 2026" optional error={e.timeframe} />
      </div>
      <TextArea name="message" label="O que a equipa precisa de aprender" optional rows={5} error={e.message} hint="Funções da equipa, nível atual, objetivos. Quanto mais concreto, mais certa a proposta." />
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <SubmitButton>Pedir proposta</SubmitButton>
        <p className="text-xs text-tertiary">Usamos estes dados só para responder a este pedido.</p>
      </div>
    </form>
  );
}
