'use client';

import { ArrowLeft, ArrowRight, Building2, Check, Minus, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useMemo, useRef, useState } from 'react';
import { enroll, type FormState } from '@/app/actions';
import { formatPrice } from '@/lib/format';
import { gsap, prefersReducedMotion, useGSAP } from '../motion/gsap';
import { FormAlert, Honeypot, SubmitButton, TextField } from '../site/Form';

export interface EnrollSession {
  id: string;
  dates: string; // "15–17 Novembro 2026"
  location: string;
  remaining: number;
}

const STEPS = ['Turma', 'Dados', 'Confirmar'] as const;
const FIELD_STEP: Record<string, number> = {
  sessionId: 0,
  participants: 0,
  fullName: 1,
  email: 1,
  phone: 1,
  company: 1,
  taxId: 1,
  isCompany: 1,
};

export function EnrollForm({
  slug,
  courseTitle,
  sessions,
  price,
  currency,
}: {
  slug: string;
  courseTitle: string;
  sessions: EnrollSession[];
  price: number;
  currency: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(enroll.bind(null, slug), { ok: false });
  const [step, setStep] = useState(0);
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '');
  const [wanted, setParticipants] = useState(1);
  const [isCompany, setIsCompany] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const root = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);

  const session = sessions.find((s) => s.id === sessionId);
  const max = Math.max(1, Math.min(50, session?.remaining ?? 1));
  const participants = Math.min(wanted, max); // ao mudar para uma turma com menos vagas
  const errors = { ...(state.errors ?? {}), ...localErrors };
  const total = useMemo(() => price * participants, [price, participants]);

  // Erro do servidor: volta ao passo do primeiro campo com erro (ajuste durante a renderização).
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    const first = Object.keys(state.errors ?? {})[0];
    if (first && FIELD_STEP[first] !== undefined) setStep(FIELD_STEP[first]);
  }

  // Transição entre passos.
  useGSAP(
    () => {
      const el = stepRefs.current[step];
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(el, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' });
      gsap.to('[data-step-bar]', { scaleX: step / (STEPS.length - 1), duration: 0.6, ease: 'expo.out' });
    },
    { dependencies: [step], scope: root }
  );

  /** Valida os campos visíveis do passo atual antes de avançar. */
  function validateStep(i: number) {
    const el = stepRefs.current[i];
    if (!el) return true;
    const next: Record<string, string> = {};
    el.querySelectorAll<HTMLInputElement>('input[required], select[required]').forEach((input) => {
      if (!input.checkValidity()) {
        next[input.name] =
          input.type === 'email' ? 'Indique um email válido.' : input.validity.valueMissing ? 'Campo obrigatório.' : 'Valor inválido.';
      }
    });
    if (i === 1) {
      const phone = el.querySelector<HTMLInputElement>('input[name="phone"]')?.value ?? '';
      if (phone.replace(/\D/g, '').length < 9) next.phone = 'Indique um telefone com pelo menos 9 dígitos.';
    }
    setLocalErrors(next);
    const firstName = Object.keys(next)[0];
    if (firstName) el.querySelector<HTMLElement>(`[name="${firstName}"]`)?.focus();
    return !firstName;
  }

  function go(to: number) {
    if (to > step && !validateStep(step)) return;
    setLocalErrors({});
    setStep(to);
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[data-step-title]')?.focus());
  }

  return (
    <div ref={root}>
      {/* Indicador de passos */}
      <ol className="relative mb-10 grid grid-cols-3" aria-label="Passos da inscrição">
        <span aria-hidden className="absolute top-4 right-[16.66%] left-[16.66%] h-px bg-line" />
        <span aria-hidden data-step-bar className="absolute top-4 left-[16.66%] h-px w-[66.66%] origin-left scale-x-0 bg-brand-500" />
        {STEPS.map((label, i) => (
          <li key={label} className="relative flex flex-col items-center gap-2 text-center" aria-current={i === step ? 'step' : undefined}>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-1 transition-colors duration-500 ${
                i < step ? 'bg-brand-300 text-white ring-brand-300' : i === step ? 'bg-brand-600 text-white ring-brand-600' : 'bg-paper text-tertiary ring-line'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={`text-xs font-semibold tracking-wide uppercase ${i === step ? 'text-ink' : 'text-tertiary'}`}>{label}</span>
          </li>
        ))}
      </ol>

      <form action={action} noValidate className="relative">
        <Honeypot />
        <input type="hidden" name="isCompany" value={isCompany ? '1' : '0'} />
        {state.message && step === 2 && (
          <div className="mb-6">
            <FormAlert message={state.message} />
          </div>
        )}

        {/* Passo 1 — Turma */}
        <fieldset ref={(el) => void (stepRefs.current[0] = el)} hidden={step !== 0} className="grid gap-6">
          <legend data-step-title tabIndex={-1} className="mb-2 text-2xl font-semibold tracking-tight text-ink outline-none">
            Escolha a turma
          </legend>
          <div className="grid gap-3" role="radiogroup" aria-label="Turmas disponíveis">
            {sessions.map((s) => (
              <label
                key={s.id}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line transition-all has-[:checked]:ring-2 has-[:checked]:ring-brand-600 has-[:focus-visible]:ring-brand-400"
              >
                <input
                  type="radio"
                  name="sessionId"
                  value={s.id}
                  checked={sessionId === s.id}
                  onChange={() => setSessionId(s.id)}
                  className="sr-only"
                  required
                />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-line group-has-[:checked]:bg-brand-600 group-has-[:checked]:ring-brand-600">
                  <span className="h-2 w-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-ink">{s.dates}</span>
                  <span className="block text-sm text-tertiary">{s.location}</span>
                </span>
                <span className={`text-sm font-semibold ${s.remaining <= 5 ? 'text-amber-700' : 'text-tertiary'}`}>
                  {s.remaining} {s.remaining === 1 ? 'vaga' : 'vagas'}
                </span>
              </label>
            ))}
          </div>
          {errors.sessionId && <p className="text-sm text-red-700">{errors.sessionId}</p>}

          <div>
            <label htmlFor="f-participants" className="text-sm font-medium text-ink">
              Número de participantes
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParticipants((n) => Math.max(1, n - 1))}
                disabled={participants <= 1}
                aria-label="Menos um participante"
                className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-line transition-colors hover:bg-brand-600 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <input
                id="f-participants"
                name="participants"
                type="number"
                inputMode="numeric"
                min={1}
                max={max}
                value={participants}
                onChange={(e) => setParticipants(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
                aria-describedby="f-participants-hint"
                className="input-form w-24 text-center text-lg font-semibold"
              />
              <button
                type="button"
                onClick={() => setParticipants((n) => Math.min(max, n + 1))}
                disabled={participants >= max}
                aria-label="Mais um participante"
                className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-line transition-colors hover:bg-brand-600 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p id="f-participants-hint" className="mt-2 text-xs text-tertiary">
              Para mais de {max} pessoas, peça uma <Link href="/empresas#proposta" className="font-semibold text-royal underline-offset-4 hover:underline">formação à medida</Link>.
            </p>
            {errors.participants && <p className="mt-2 text-sm text-red-700">{errors.participants}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => go(1)} className="btn btn-dark">
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </fieldset>

        {/* Passo 2 — Dados */}
        <fieldset ref={(el) => void (stepRefs.current[1] = el)} hidden={step !== 1} className="grid gap-5">
          <legend data-step-title tabIndex={-1} className="mb-2 text-2xl font-semibold tracking-tight text-ink outline-none">
            Os seus dados
          </legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Quem paga a inscrição">
            {[
              { v: false, label: 'Particular', Icon: User },
              { v: true, label: 'Empresa', Icon: Building2 },
            ].map(({ v, label, Icon }) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={isCompany === v}
                onClick={() => setIsCompany(v)}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl text-sm font-semibold ring-1 transition-colors ${
                  isCompany === v ? 'bg-brand-600 text-white ring-brand-600' : 'bg-paper text-ink ring-line hover:ring-brand-300'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
          {isCompany && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="company" label="Empresa" autoComplete="organization" error={errors.company} />
              <TextField name="taxId" label="NIF" optional inputMode="numeric" error={errors.taxId} hint="Para a fatura." />
            </div>
          )}
          <TextField name="fullName" label={isCompany ? 'Nome da pessoa de contacto' : 'Nome completo'} autoComplete="name" error={errors.fullName} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" error={errors.email} hint="Enviamos a confirmação para aqui." />
            <TextField
              name="phone"
              label="Telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              error={errors.phone}
              hint="Ligamos para este número para confirmar a vaga."
            />
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <button type="button" onClick={() => go(0)} className="btn btn-outline-dark">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
            </button>
            <button type="button" onClick={() => go(2)} className="btn btn-dark">
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </fieldset>

        {/* Passo 3 — Confirmar */}
        <fieldset ref={(el) => void (stepRefs.current[2] = el)} hidden={step !== 2} className="grid gap-6">
          <legend data-step-title tabIndex={-1} className="mb-2 text-2xl font-semibold tracking-tight text-ink outline-none">
            Confirme a inscrição
          </legend>

          <dl className="grid gap-3 rounded-2xl bg-background p-5 text-sm ring-1 ring-line">
            <div className="flex justify-between gap-4">
              <dt className="text-tertiary">Curso</dt>
              <dd className="text-right font-medium text-ink">{courseTitle}</dd>
            </div>
            {session && (
              <div className="flex justify-between gap-4">
                <dt className="text-tertiary">Turma</dt>
                <dd className="text-right font-medium text-ink">
                  {session.dates} · {session.location}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-tertiary">Participantes</dt>
              <dd className="font-medium text-ink">
                {price > 0 ? `${participants} × ${formatPrice(price, currency)}` : participants}
              </dd>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="text-2xl font-semibold tracking-tight text-ink">{price > 0 ? formatPrice(total, currency) : 'Sob consulta'}</dd>
            </div>
          </dl>

          <div className="flex flex-col-reverse justify-between gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={() => go(1)} className="btn btn-outline-dark">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
            </button>
            <SubmitButton pendingText="A registar…">Confirmar inscrição</SubmitButton>
          </div>
          <p className="text-xs text-tertiary">Não paga nada agora. Depois de confirmar, a nossa equipa contacta-o para validar a vaga e combinar o pagamento.</p>
        </fieldset>
      </form>
    </div>
  );
}
