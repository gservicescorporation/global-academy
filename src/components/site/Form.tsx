'use client';

import { ArrowUpRight, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

type Common = { name: string; label: string; error?: string; hint?: string; optional?: boolean; className?: string };

function Wrap({ name, label, error, hint, optional, className = '', children }: Common & { children: ReactNode }) {
  return (
    <div className={`input-label ${className}`}>
      <label htmlFor={`f-${name}`} className="text-sm font-medium text-ink">
        {label} {optional && <span className="font-normal text-tertiary">(opcional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`f-${name}-hint`} className="text-xs text-tertiary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`f-${name}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: string) => (error ? `f-${name}-error` : hint ? `f-${name}-hint` : undefined);

export function TextField({
  type = 'text',
  defaultValue,
  autoComplete,
  inputMode,
  min,
  max,
  placeholder,
  ...c
}: Common & {
  type?: string;
  defaultValue?: string | number;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <Wrap {...c}>
      <input
        id={`f-${c.name}`}
        name={c.name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        placeholder={placeholder}
        required={!c.optional}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className={`input-form ${c.error ? 'border-red-400' : ''}`}
      />
    </Wrap>
  );
}

export function TextArea({ rows = 5, defaultValue, ...c }: Common & { rows?: number; defaultValue?: string }) {
  return (
    <Wrap {...c}>
      <textarea
        id={`f-${c.name}`}
        name={c.name}
        rows={rows}
        defaultValue={defaultValue}
        required={!c.optional}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className={`input-form resize-y ${c.error ? 'border-red-400' : ''}`}
      />
    </Wrap>
  );
}

export function SelectField({
  options,
  defaultValue,
  placeholder = 'Escolha…',
  ...c
}: Common & { options: { value: string; label: string }[]; defaultValue?: string; placeholder?: string }) {
  return (
    <Wrap {...c}>
      <select
        id={`f-${c.name}`}
        name={c.name}
        defaultValue={defaultValue ?? ''}
        required={!c.optional}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        className={`input-form appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b6478' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10 ${
          c.error ? 'border-red-400' : ''
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

/** Campo escondido anti-spam: pessoas não o veem nem o preenchem. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Não preencher
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitButton({ children, pendingText = 'A enviar…', className = 'btn btn-dark' }: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {pendingText}
        </>
      ) : (
        <>
          {children} <ArrowUpRight className="h-4 w-4" aria-hidden />
        </>
      )}
    </button>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
      {message}
    </p>
  );
}
