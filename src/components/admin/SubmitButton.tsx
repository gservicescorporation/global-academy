'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export function SubmitButton({
  children, pendingText = 'A guardar…', className = 'btn btn-primary',
}: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:pointer-events-none disabled:opacity-60`}>
      {pending && <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {pending ? pendingText : children}
    </button>
  );
}
