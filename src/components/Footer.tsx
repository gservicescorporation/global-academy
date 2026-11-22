'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import Magnetic from './motion/Magnetic';
import { gsap, prefersReducedMotion, useGSAP } from './motion/gsap';

const FOOT_LINKS = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/calendario', label: 'Calendário' },
  { href: '/empresas', label: 'Formação para empresas' },
  { href: '/sobre', label: 'Sobre a academia' },
  { href: '/contacto', label: 'Contactos' },
];

export function Footer({ s }: { s: Record<string, string> }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '[data-wordmark]', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      });
      tl.fromTo('[data-wm-line="1"]', { xPercent: -18, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none' }, 0).fromTo(
        '[data-wm-shine]',
        { attr: { x1: '-60%', x2: '-20%' } },
        { attr: { x1: '100%', x2: '140%' }, ease: 'none' },
        0
      );
      gsap.from('[data-foot-col]', { y: 40, opacity: 0, stagger: 0.08, scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } });
    },
    { scope: ref }
  );

  const wordmark = s.site_name || 'Academia GSC';
  const socials = [
    { name: 'Facebook', href: s.social_facebook },
    { name: 'Instagram', href: s.social_instagram },
    { name: 'LinkedIn', href: s.social_linkedin },
  ].filter((so) => /^https?:\/\//.test(so.href ?? ''));

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-royal/25 blur-[140px]" />

      <div className="container-x relative pt-24 pb-10 sm:pt-32">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end">
          <div data-foot-col className="max-w-3xl">
            <span className="eyebrow text-accent">Contactos</span>
            <h2 className="display-lg mt-5">
              Tem uma dúvida sobre um curso? <span className="serif-accent text-white/60">Fale connosco.</span>
            </h2>
          </div>
          <div data-foot-col>
            <Magnetic>
              <Link
                href="/contacto"
                className="group flex h-36 w-36 flex-col items-center justify-center gap-1 rounded-full bg-accent text-center text-sm font-semibold text-ink transition-transform duration-500 hover:scale-105 sm:h-44 sm:w-44"
              >
                <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                Contactar
              </Link>
            </Magnetic>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div data-foot-col className="lg:col-span-4">
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo_url} alt={s.site_name} className="h-11 w-auto brightness-0 invert" />
            ) : (
              <span className="font-head text-xl font-extrabold tracking-tight">{s.site_name}</span>
            )}
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">{s.site_tagline}</p>
            {s.parent_company && (
              <p className="mt-3 max-w-xs text-sm text-white/55">
                {s.site_name} é uma empresa da <b className="font-semibold text-white/70">{s.parent_company}</b>.
              </p>
            )}
          </div>

          <div data-foot-col className="lg:col-span-2">
            <h3 className="eyebrow text-white/55">Navegar</h3>
            <ul className="mt-5 flex flex-col gap-1 text-sm">
              {FOOT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-white/80 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-foot-col className="lg:col-span-3">
            <h3 className="eyebrow text-white/55">Contactos</h3>
            <ul className="mt-5 flex flex-col gap-1 text-sm text-white/80">
              {s.contact_email && (
                <li>
                  <a href={`mailto:${s.contact_email.trim()}`} className="inline-flex min-h-9 items-center break-all transition-colors hover:text-accent">
                    {s.contact_email}
                  </a>
                </li>
              )}
              {[s.contact_phone, s.contact_phone_2].filter(Boolean).map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-9 items-center transition-colors hover:text-accent">
                    {p}
                  </a>
                </li>
              ))}
              {s.contact_address && <li className="pt-2 whitespace-pre-line text-white/60">{s.contact_address}</li>}
              {s.contact_hours && <li className="text-white/60">{s.contact_hours}</li>}
            </ul>
          </div>

          <div data-foot-col className="lg:col-span-3">
            <h3 className="eyebrow text-white/55">Siga-nos</h3>
            <ul className="mt-5 flex flex-col gap-2">
              {socials.map((so) => (
                <li key={so.name}>
                  <a
                    href={so.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-h-11 items-center justify-between border-b border-white/10 py-2.5 text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {so.name}
                    <ArrowUpRight className="h-4 w-4 text-white/50 transition-all duration-300 group-hover:rotate-45 group-hover:text-accent" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-wordmark aria-hidden className="flex flex-col gap-1 overflow-hidden select-none">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="wm-shine" data-wm-shine gradientUnits="userSpaceOnUse" x1="-60%" x2="-20%" y1="0" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
                <stop offset="0.5" stopColor="#51b7ff" stopOpacity="0.35" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.06" />
              </linearGradient>
            </defs>
          </svg>
          <svg data-wm-line="1" viewBox="0 0 1000 108" className="block w-full">
            <text
              x="0"
              y="96"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="url(#wm-shine)"
              className="font-extrabold"
              style={{ fontSize: 120, letterSpacing: '-0.04em' }}
            >
              {wordmark.toUpperCase()}
            </text>
          </svg>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.site_name}
            {s.parent_company ? ` · ${s.parent_company}` : ''}. Todos os direitos reservados.
          </p>
          <Link href="/admin/login" className="hover:text-white/70">
            Área reservada
          </Link>
        </div>
      </div>
    </footer>
  );
}
