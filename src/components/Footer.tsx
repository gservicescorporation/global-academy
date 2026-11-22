'use client';

import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import Magnetic from './motion/Magnetic';
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from './motion/gsap';
import { BrandLogo } from './site/BrandLogo';

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
      // Selo circular: gira sempre; o scroll acelera-o e inverte-o conforme a direção.
      const spin = gsap.to('[data-badge-text]', { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      const st = ScrollTrigger.create({
        onUpdate(self) {
          const v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(spin, { timeScale: (1 + v) * (self.direction === 1 ? 1 : -1), duration: 0.3, overwrite: true });
          gsap.to(spin, { timeScale: self.direction === 1 ? 1 : -1, duration: 1.2, delay: 0.3, overwrite: false });
        },
      });
      // Rodapé "sobe" com cantos que se arredondam enquanto entra.
      gsap.fromTo(
        ref.current,
        { borderTopLeftRadius: '0rem', borderTopRightRadius: '0rem' },
        { borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 55%', scrub: true } }
      );
      gsap.from('[data-foot-col]', { y: 32, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '[data-foot-cols]', start: 'top 90%', once: true } });
      return () => st.kill();
    },
    { scope: ref }
  );

  const socials = [
    { name: 'Facebook', href: s.social_facebook },
    { name: 'Instagram', href: s.social_instagram },
    { name: 'LinkedIn', href: s.social_linkedin },
  ].filter((so) => /^https?:\/\//.test(so.href ?? ''));
  const badge = `FORMAÇÃO PROFISSIONAL • ${(s.site_name || 'Academia').toUpperCase()} • LUANDA • `;

  return (
    <footer ref={ref} className="relative overflow-hidden bg-brand-100 text-ink">
      <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-48 -right-24 h-[34rem] w-[34rem] rounded-full bg-brand-200 blur-3xl" />

      <div className="container-x relative pt-20 pb-10 sm:pt-28">
        <div className="grid items-center gap-12 border-b border-brand-200 pb-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <span className="eyebrow bg-white">Contactos</span>
            <h2 className="display-lg mt-6 text-balance">
              Tem uma dúvida sobre um curso? <span className="hl">Fale connosco.</span>
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {s.contact_phone && (
                <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, '')}`} className="btn btn-light">
                  <Phone className="h-4 w-4" aria-hidden /> {s.contact_phone}
                </a>
              )}
              {s.contact_email && (
                <a href={`mailto:${s.contact_email.trim()}`} className="btn btn-light">
                  <Mail className="h-4 w-4" aria-hidden /> {s.contact_email}
                </a>
              )}
            </div>
          </div>

          {/* Selo circular */}
          <div className="flex justify-start lg:col-span-4 lg:justify-end">
            <Magnetic strength={0.25}>
              <Link href="/contacto" aria-label="Ir para a página de contactos" className="group relative block h-40 w-40 sm:h-48 sm:w-48">
                <svg data-badge-text viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                  <defs>
                    <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                  </defs>
                  <text className="fill-brand-700 text-[13px] font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                    {/* textLength = perímetro do círculo (2π·78): o texto fecha a volta certinho. */}
                    <textPath href="#badge-circle" textLength={488} lengthAdjust="spacing">
                      {badge}
                    </textPath>
                  </text>
                </svg>
                <span className="absolute inset-[26%] flex items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_18px_40px_-16px_rgb(2_119_195/0.9)] transition-transform duration-500 group-hover:scale-110">
                  <ArrowUpRight className="h-7 w-7 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </span>
              </Link>
            </Magnetic>
          </div>
        </div>

        <div data-foot-cols className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div data-foot-col className="lg:col-span-4">
            {s.logo_url ? <BrandLogo src={s.logo_url} alt={s.site_name} className="h-10" /> : <span className="font-head text-xl font-semibold tracking-tight">{s.site_name}</span>}
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-tertiary">{s.site_tagline}</p>
            {s.parent_company && (
              <p className="mt-3 max-w-xs text-sm text-tertiary">
                {s.site_name} é uma empresa da <b className="font-semibold text-ink">{s.parent_company}</b>.
              </p>
            )}
          </div>

          <div data-foot-col className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-ink">Navegar</h3>
            <ul className="mt-4 flex flex-col gap-1 text-sm">
              {FOOT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-tertiary transition-colors hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-foot-col className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-ink">Onde estamos</h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-tertiary">
              {s.contact_phone_2 && (
                <li>
                  <a href={`tel:${s.contact_phone_2.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-9 items-center hover:text-brand-700">
                    {s.contact_phone_2}
                  </a>
                </li>
              )}
              {s.contact_address && <li className="whitespace-pre-line">{s.contact_address}</li>}
              {s.contact_hours && <li>{s.contact_hours}</li>}
            </ul>
          </div>

          <div data-foot-col className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-ink">Siga-nos</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((so) => (
                <li key={so.name}>
                  <a
                    href={so.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-ink ring-1 ring-brand-200 transition-colors hover:bg-brand-600 hover:text-white hover:ring-brand-600"
                  >
                    {so.name}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-brand-200 pt-6 text-xs text-tertiary sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.site_name}
            {s.parent_company ? ` · ${s.parent_company}` : ''}. Todos os direitos reservados.
          </p>
          <Link href="/admin/login" className="hover:text-ink">
            Área reservada
          </Link>
        </div>
      </div>
    </footer>
  );
}
