'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ADMIN_NAV_INDEX } from '@/lib/admin-nav';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function AdminSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = q.trim() ? ADMIN_NAV_INDEX.filter((i) => norm(i.label).includes(norm(q)) || norm(i.group).includes(norm(q))) : ADMIN_NAV_INDEX;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQ('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-line bg-background px-4 py-2.5 text-sm text-tertiary transition hover:border-ink/20 sm:flex"
      >
        <Search className="h-4 w-4 flex-none" aria-hidden /> Pesquisar no painel…
      </button>
      <button type="button" aria-label="Pesquisar" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-tertiary hover:bg-background sm:hidden">
        <Search className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-x-4 top-20 z-10 grid gap-0.5 rounded-2xl border border-line bg-paper p-2 text-[14.5px] shadow-2xl sm:absolute sm:inset-x-auto sm:top-[calc(100%+8px)] sm:left-0 sm:w-72">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5">
            <Search className="h-4 w-4 flex-none text-tertiary" aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) go(results[0].href);
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Pesquisar no painel…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-tertiary"
            />
          </div>
          <div className="mt-1 grid max-h-[60vh] gap-0.5 overflow-y-auto">
            {results.length === 0 && <p className="px-3 py-2.5 text-tertiary">Sem resultados.</p>}
            {results.map((r) => (
              <button key={r.href} type="button" onClick={() => go(r.href)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-tertiary hover:bg-background hover:text-ink">
                <Icon name={r.icon} className="h-[18px] w-[18px] flex-none" strokeWidth={1.8} />
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
