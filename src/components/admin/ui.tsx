'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useTransition, type ReactNode } from 'react';
import type { Result } from '@/server/guard';
import { useToast } from './ToastProvider';

export const inputCls =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/10 placeholder:text-muted aria-[invalid=true]:border-red-400';

export function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <label htmlFor={htmlFor} className="font-medium text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {error ? <span className="text-xs text-red-700">{error}</span> : hint ? <span className="text-xs text-tertiary">{hint}</span> : null}
    </div>
  );
}

type InputProps = {
  label: string;
  hint?: string;
  error?: string;
  value: string | number | undefined | null;
  onChange: (v: string) => void;
  className?: string;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'required'>;

export function TextInput({ label, hint, error, value, onChange, className, required, ...rest }: InputProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <input id={id} {...rest} aria-invalid={error ? true : undefined} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  value,
  onChange,
  rows = 4,
  className,
  required,
  placeholder,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string | undefined | null;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder,
  className,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string | undefined | null;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <select id={id} aria-invalid={error ? true : undefined} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line bg-white p-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-tertiary">{hint}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

/** Interruptor compacto (também usado nas listas). */
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="h-6 w-11 rounded-full bg-line transition peer-checked:bg-royal peer-focus-visible:ring-4 peer-focus-visible:ring-royal/25 peer-disabled:opacity-50" />
      <span className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    </span>
  );
}

export function Card({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-tertiary">{description}</p>}
        </div>
        {action}
      </header>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function PageTitle({ title, text, action, back }: { title: string; text?: string; action?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-8">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {text && <p className="mt-1 max-w-2xl text-sm text-tertiary">{text}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-tertiary">{children}</div>;
}

export function Badge({ children, tone = 'bg-background text-tertiary' }: { children: ReactNode; tone?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tone}`}>{children}</span>;
}

export const btn = {
  primary: 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-royal disabled:opacity-60',
  secondary: 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink transition hover:border-ink disabled:opacity-60',
  danger: 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60',
  icon: 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-tertiary transition hover:bg-background hover:text-ink disabled:opacity-40',
};

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />;
}

/** Executa uma server action com estado, toast e refresh da página. */
export function useAction() {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const call = <T,>(fn: () => Promise<Result<T>>, opts: { success?: string; after?: (data: T | undefined) => void; refresh?: boolean } = {}) =>
    new Promise<Result<T>>((resolve) =>
      start(async () => {
        const res = await fn();
        if (!res.ok) push({ type: 'error', message: res.error });
        else {
          if (opts.success ?? res.message) push({ type: 'success', message: (opts.success ?? res.message) as string });
          opts.after?.(res.data);
          if (opts.refresh !== false) router.refresh();
        }
        resolve(res);
      })
    );
  return { pending, call };
}

/** Avisa antes de sair da página com alterações por guardar (fecho do separador e links internos). */
export function useUnsavedWarning(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.href.startsWith('mailto:')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      if (!window.confirm('Tem alterações por guardar. Sair sem guardar?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, []);
}
