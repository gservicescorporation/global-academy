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
    <section className="section-y bg-paper">
      <div className="container-x">
        <span data-reveal="fade" className="eyebrow text-royal">
          Testemunhos
        </span>
        <SplitReveal className="display-lg mt-6 max-w-3xl text-balance text-ink">
          <Accent text={title} className="serif-accent text-royal" />
        </SplitReveal>

        <figure data-reveal="up" className="relative mt-14 overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-14">
          <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
          <Quote className="relative h-10 w-10 text-accent" aria-hidden />
          <blockquote className="relative mt-6 max-w-4xl text-[clamp(1.4rem,2.8vw,2.25rem)] leading-snug font-medium tracking-tight">
            “{first.quote}”
          </blockquote>
          <Person t={first} dark />
        </figure>

        {rest.length > 0 && (
          <ul className="mt-6 columns-1 gap-6 md:columns-2 lg:columns-3">
            {rest.map((t, i) => (
              <li key={t.id} data-reveal="up" data-reveal-delay={(i % 3) * 0.06} className="mb-6 break-inside-avoid">
                <figure className="rounded-[1.75rem] bg-background p-8 ring-1 ring-line">
                  <blockquote className="text-lg leading-relaxed text-ink">“{t.quote}”</blockquote>
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

function Person({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  const detail = [t.role, t.company].filter(Boolean).join(' · ');
  return (
    <figcaption className="relative mt-8 flex items-center gap-4">
      <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ${dark ? 'bg-white/10' : 'bg-ink text-white'}`}>
        {t.photoUrl ? <Img src={t.photoUrl} alt="" fill sizes="48px" className="object-cover" /> : initials(t.name)}
      </span>
      <span>
        <span className="block font-semibold">{t.name}</span>
        {detail && <span className={`block text-sm ${dark ? 'text-white/60' : 'text-tertiary'}`}>{detail}</span>}
      </span>
    </figcaption>
  );
}
