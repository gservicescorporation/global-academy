import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Icon } from '../Icon';
import SplitReveal from '../motion/SplitReveal';
import StackCards from '../motion/StackCards';
import { Accent } from '../site/Accent';
import type { WhyItem } from '@/lib/entities';

/** Tons crescentes de azul: os dois primeiros claros (texto escuro), os outros fortes (texto branco). */
const TONES = [
  { card: 'bg-brand-100 text-ink', num: 'text-brand-300', icon: 'bg-white text-brand-700', body: 'text-tertiary' },
  { card: 'bg-brand-200 text-ink', num: 'text-brand-400', icon: 'bg-white text-brand-700', body: 'text-brand-900/80' },
  { card: 'bg-brand-600 text-white on-blue', num: 'text-brand-400', icon: 'bg-white/15 text-white', body: 'text-white' },
  { card: 'bg-brand-800 text-white on-blue', num: 'text-brand-600', icon: 'bg-white/15 text-white', body: 'text-white' },
];

export function Why({ items, title, text }: { items: WhyItem[]; title: string; text?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="section-y relative bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span data-reveal="fade" className="eyebrow">
            Porquê a academia
          </span>
          <SplitReveal className="display-lg mt-6 text-balance text-ink">
            <Accent text={title} />
          </SplitReveal>
          {text && (
            <p data-reveal className="mx-auto mt-6 max-w-xl text-lg text-tertiary">
              {text}
            </p>
          )}
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <StackCards offset={6}>
            {items.map((w, i) => {
              const t = TONES[i % TONES.length];
              return (
                <article key={w.id} className={`relative grid min-h-64 items-center gap-6 overflow-hidden rounded-[2rem] p-8 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-12 ${t.card}`}>
                  <span aria-hidden className={`font-head text-[6.5rem] leading-none font-semibold tracking-tighter sm:text-[9rem] ${t.num}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.icon}`}>
                      <Icon name={w.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 font-head text-3xl font-semibold tracking-tight sm:text-4xl">{w.title}</h3>
                    <p className={`mt-3 max-w-md sm:text-lg ${t.body}`}>{w.text}</p>
                  </div>
                </article>
              );
            })}
          </StackCards>
          <div className="mt-12 text-center">
            <Link data-reveal href="/sobre" className="btn btn-dark">
              Conhecer a academia <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
