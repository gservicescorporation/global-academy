'use client';

import { ArrowUpRight, ChevronDown, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { AdminSearch } from './AdminSearch';

export function AdminHeader({ email, onMenu, logoutAction }: { email: string; onMenu: () => void; logoutAction: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = email.slice(0, 1).toUpperCase();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur-xl lg:left-[272px] lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Abrir menu" onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-tertiary hover:bg-background lg:hidden">
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <AdminSearch />
      </div>

      <div ref={ref} className="relative flex items-center gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-3 rounded-full py-1.5 pr-3 pl-1.5 transition hover:bg-background">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-royal/10 text-[15px] font-bold text-royal">{initial}</span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[180px] truncate text-[14px] font-semibold leading-tight text-ink">{email}</span>
            <span className="block text-xs text-tertiary">Administrador</span>
          </span>
          <ChevronDown className="h-4 w-4 text-tertiary" aria-hidden />
        </button>

        {open && (
          <div className="absolute top-[calc(100%+8px)] right-0 grid w-56 gap-1 rounded-2xl border border-line bg-paper p-2 text-[14.5px] shadow-2xl">
            <a href="/" target="_blank" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-tertiary hover:bg-background hover:text-ink">
              <ArrowUpRight className="h-4 w-4" aria-hidden /> Ver site
            </a>
            <Link href="/admin/utilizadores" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-tertiary hover:bg-background hover:text-ink">
              <Icon name="users" className="h-4 w-4" strokeWidth={1.8} /> A minha conta
            </Link>
            <button type="button" onClick={logoutAction} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" aria-hidden /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
