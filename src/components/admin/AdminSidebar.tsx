'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { ADMIN_NAV_GROUPS as GROUPS } from '@/lib/admin-nav';

export function AdminSidebar({ open, onClose, logoUrl, siteName }: { open: boolean; onClose: () => void; logoUrl?: string; siteName?: string }) {
  const pathname = usePathname();
  useEffect(() => onClose(), [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-ink text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] flex-none items-center gap-2.5 border-b border-white/10 px-6">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName ?? 'Logótipo'} className="h-8 w-auto brightness-0 invert" />
          ) : (
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-accent text-ink">
              <Icon name="book" className="h-5 w-5" />
            </span>
          )}
          <span className="text-lg font-extrabold tracking-tight">Painel</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Navegação do painel">
          {GROUPS.map((g) => (
            <div key={g.label || 'main'} className="mb-6 last:mb-0">
              {g.label && <p className="mb-2 px-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">{g.label}</p>}
              <div className="grid gap-0.5">
                {g.links.map(({ href, label, icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition ${
                        active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon name={icon} className="h-[18px] w-[18px] flex-none" strokeWidth={1.8} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex-none border-t border-white/10 p-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium text-white/60 hover:bg-white/5 hover:text-white">
            <ArrowUpRight className="h-[18px] w-[18px] flex-none" aria-hidden />
            Ver site
          </Link>
        </div>
      </aside>
    </>
  );
}
