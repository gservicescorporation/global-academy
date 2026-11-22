'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './motion/gsap';
import { BrandLogo } from './site/BrandLogo';

const LINKS = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/calendario', label: 'Calendário' },
  { href: '/empresas', label: 'Empresas' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar({ siteName, logoUrl }: { siteName: string; logoUrl?: string }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Barra esconde-se ao descer e volta ao subir; ganha fundo depois do topo.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          setScrolled(self.scroll() > 24);
          const hide = self.scroll() > 160 && self.direction === 1;
          gsap.to(header, { yPercent: hide ? -100 : 0, duration: 0.5, ease: 'power3.out', overwrite: true });
        },
      });
      return () => st.kill();
    },
    { scope: headerRef }
  );

  // Painel lateral: entra da direita, ligações em cascata, contactos por último.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      gsap.set(panel, { autoAlpha: 0 });
      gsap.set(panel.querySelector('[data-sheet]'), { xPercent: 100 });
      menuTl.current = gsap
        .timeline({ paused: true })
        .to(panel, { autoAlpha: 1, duration: 0.25 })
        .to(panel.querySelector('[data-sheet]'), { xPercent: 0, duration: 0.7, ease: 'expo.out' }, 0)
        .from(panel.querySelectorAll('[data-menu-item]'), { x: 60, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'expo.out' }, 0.15)
        .from(panel.querySelectorAll('[data-menu-foot]'), { y: 16, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.35);
    },
    { scope: panelRef }
  );

  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
      document.documentElement.classList.add('lenis-stopped');
      panelRef.current?.querySelector<HTMLElement>('[data-close]')?.focus();
    } else {
      tl.timeScale(1.8).reverse();
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled ? 'bg-white/85 shadow-[0_1px_0_var(--color-line),0_10px_30px_-20px_rgb(8_43_71/0.35)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <Link href="/" aria-label={`${siteName} — início`} className="shrink-0">
            {logoUrl ? <BrandLogo src={logoUrl} alt={siteName} className="h-9 sm:h-10" /> : <span className="font-head text-xl font-semibold tracking-tight text-ink">{siteName}</span>}
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full bg-white/70 p-1 ring-1 ring-line backdrop-blur">
              {LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                        active ? 'bg-brand-600 text-white' : 'text-tertiary hover:bg-brand-50 hover:text-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cursos" className="btn btn-dark hidden lg:inline-flex">
              Inscrever-me <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="menu-movel"
              className="flex min-h-11 items-center gap-3 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-line lg:hidden"
            >
              Menu
              <span aria-hidden className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded bg-ink" />
                <span className="block h-0.5 w-2.5 rounded bg-brand-500" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div ref={panelRef} id="menu-movel" className="invisible fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" data-lenis-prevent>
        <button type="button" aria-label="Fechar menu" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
        <div data-sheet className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-brand-50 px-6 pt-6 pb-10">
          <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
          <div className="relative flex items-center justify-between">
            <span className="eyebrow">Menu</span>
            <button data-close type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink ring-1 ring-line">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="Menu móvel" className="relative mt-10">
            <ul className="flex flex-col gap-1">
              {LINKS.map((link, i) => (
                <li key={link.href}>
                  <Link
                    data-menu-item
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className="group flex items-center justify-between rounded-2xl px-3 py-3 font-head text-4xl font-semibold tracking-tight text-ink transition-colors hover:bg-white"
                  >
                    <span>
                      <span className="mr-3 align-middle text-xs font-semibold text-brand-500 tabular-nums">0{i + 1}</span>
                      {link.label}
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-brand-500 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link data-menu-foot href="/cursos" onClick={() => setOpen(false)} className="btn btn-dark relative mt-8 self-start">
            Inscrever-me <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}
