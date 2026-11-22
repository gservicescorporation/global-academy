import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Icon } from '../Icon';
import SplitReveal from '../motion/SplitReveal';
import StackCards from '../motion/StackCards';
import { Accent } from '../site/Accent';
import type { WhyItem } from '@/lib/entities';

const COLORS = ['bg-royal', 'bg-main', 'bg-ink', 'bg-night'];

/** Porquê a academia: título fixo à esquerda, cartões que se empilham à direita. */
export function Why({ items, title, text }: { items: WhyItem[]; title: string; text?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="section-y relative bg-paper">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <span data-reveal="fade" className="eyebrow text-royal">
              Porquê a academia
            </span>
            <SplitReveal className="display-lg mt-6 text-balance text-ink">
              <Accent text={title} className="serif-accent text-royal" />
            </SplitReveal>
            {text && (
              <p data-reveal className="mt-6 max-w-md text-lg text-tertiary">
                {text}
              </p>
            )}
            <Link data-reveal href="/sobre" className="btn btn-dark mt-10">
              Conhecer a academia <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <StackCards>
            {items.map((w, i) => (
              <article
                key={w.id}
                className={`relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[2rem] p-8 text-white sm:min-h-[380px] sm:p-12 ${COLORS[i % COLORS.length]}`}
              >
                <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
                <div className="relative flex items-start justify-between gap-6">
                  <span className="text-8xl font-bold tracking-tighter text-white/15 sm:text-9xl">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <Icon name={w.icon} className="h-7 w-7" />
                  </span>
                </div>
                <div className="relative mt-10">
                  <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">{w.title}</h3>
                  <p className="mt-4 max-w-md text-white/70 sm:text-lg">{w.text}</p>
                </div>
              </article>
            ))}
          </StackCards>
        </div>
      </div>
    </section>
  );
}
