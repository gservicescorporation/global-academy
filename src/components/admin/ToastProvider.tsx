'use client';

import { AlertCircle, Bell, CheckCircle2, X } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };
type ToastInput = { type?: Toast['type']; message: string };

const ToastContext = createContext<{ push: (t: ToastInput) => void } | null>(null);

const STYLE: Record<Toast['type'], { cls: string; Icon: typeof CheckCircle2 }> = {
  success: { cls: 'bg-ink text-white', Icon: CheckCircle2 },
  error: { cls: 'bg-red-600 text-white', Icon: AlertCircle },
  info: { cls: 'border border-line bg-white text-ink shadow-xl', Icon: Bell },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback(({ type = 'success', message }: ToastInput) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[300] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-8">
        {toasts.map((t) => {
          const { cls, Icon } = STYLE[t.type];
          return (
            <div key={t.id} role="status" className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl py-3 pr-2 pl-4 text-[14.5px] font-medium shadow-2xl ${cls}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1">{t.message}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Fechar" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
