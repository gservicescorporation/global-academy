import { Quote } from 'lucide-react';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';
import { Img } from '../site/Img';
import { initials } from './Trainers';
import type { Testimonial } from '@/lib/entities';

/** Testemunhos reais, geridos no painel. Sem testemunhos publicados, a secção não aparece. */
export function Testimonials({ items, title }: { items: Testimonial[]; title: string }) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span data-reveal="fade" className="eyebrow">
            Testemunhos
          </span>
          <SplitReveal className="display-lg mt-6 text-balance text-ink">
            <Accent text={title} />
          </SplitReveal>
        </div>

        <figure data-reveal="scale" className="on-blue relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-14">
          <div aria-hidden className="dots-white pointer-events-none absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <Quote className="relative h-12 w-12 text-brand-200" aria-hidden />
          <blockquote className="relative mt-6 font-head text-[clamp(1.4rem,2.8vw,2.3rem)] leading-snug font-semibold tracking-tight">“{first.quote}”</blockquote>
          <Person t={first} onBlue />
        </figure>

        {rest.length > 0 && (
          <ul className="mx-auto mt-6 max-w-5xl columns-1 gap-6 md:columns-2">
            {rest.map((t, i) => (
              <li key={t.id} data-reveal="up" data-reveal-delay={(i % 2) * 0.06} className="mb-6 break-inside-avoid">
                <figure className="rounded-[1.75rem] bg-brand-50 p-8 ring-1 ring-line">
                  <Quote className="h-7 w-7 text-brand-300" aria-hidden />
                  <blockquote className="mt-4 text-lg leading-relaxed text-ink">“{t.quote}”</blockquote>
                  <Person t={t} />
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Person({ t, onBlue = false }: { t: Testimonial; onBlue?: boolean }) {
  const detail = [t.role, t.company].filter(Boolean).join(' · ');
  return (
    <figcaption className="relative mt-8 flex items-center gap-4">
      <span
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${onBlue ? 'bg-white text-brand-700' : 'bg-brand-600 text-white'}`}
      >
        {t.photoUrl ? <Img src={t.photoUrl} alt="" fill sizes="48px" className="object-cover" /> : initials(t.name)}
      </span>
      <span>
        <span className={`block font-semibold ${onBlue ? '' : 'text-ink'}`}>{t.name}</span>
        {detail && <span className={`block text-sm ${onBlue ? 'text-white' : 'text-tertiary'}`}>{detail}</span>}
      </span>
    </figcaption>
  );
}
