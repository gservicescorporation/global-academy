'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './motion/gsap';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          setScrolled(self.scroll() > 40);
          if (self.scroll() < 120) {
            gsap.to(header, { yPercent: 0, duration: 0.4, overwrite: true });
            return;
          }
          gsap.to(header, {
            yPercent: self.direction === 1 ? -110 : 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: true,
          });
        },
      });
      return () => st.kill();
    },
    { scope: headerRef }
  );

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      gsap.set(menu, { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
      menuTl.current = gsap
        .timeline({ paused: true })
        .to(menu, { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
        .from(menu.querySelectorAll('[data-menu-item]'), { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.9 }, '-=0.35');
    },
    { scope: menuRef }
  );

  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
      document.documentElement.classList.add('lenis-stopped');
    } else {
      tl.timeScale(1.6).reverse();
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [open]);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full py-2 pr-2 pl-5 text-white transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
            scrolled || open
              ? 'bg-ink/70 shadow-[0_10px_40px_-10px_rgb(0_0_0/0.5)] ring-1 ring-white/10 backdrop-blur-xl'
              : 'bg-transparent'
          }`}
        >
          <Link href="/" aria-label={siteName} className="flex shrink-0 items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-8 w-auto brightness-0 invert sm:h-9" />
            ) : (
              <span className="font-head text-lg font-extrabold tracking-tight">{siteName}</span>
            )}
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group relative block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(link.href) ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="relative block overflow-hidden leading-5">
                      <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{link.label}</span>
                      <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
                        {link.label}
                      </span>
                    </span>
                    {isActive(link.href) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cursos" className="btn btn-light hidden py-3 lg:inline-flex">
              Ver cursos
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 lg:hidden"
            >
              <span className={`absolute h-[1.5px] w-5 bg-white transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
              <span className={`absolute h-[1.5px] w-5 bg-white transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="invisible fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-ink px-6 pt-28 pb-10 text-white lg:hidden"
        data-lenis-prevent
      >
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <nav aria-label="Menu móvel" className="relative">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link, i) => (
              <li key={link.href} className="overflow-hidden">
                <Link
                  data-menu-item
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-2 text-[2.6rem] leading-none font-semibold tracking-tight sm:text-6xl"
                >
                  <span className="text-xs font-medium text-accent tabular-nums">0{i + 1}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link data-menu-item href="/cursos" className="btn btn-light relative mt-8 w-fit">
          Ver cursos
        </Link>
      </div>
    </>
  );
}
