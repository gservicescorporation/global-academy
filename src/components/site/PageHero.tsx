import type { ReactNode } from 'react';
import SplitReveal from '../motion/SplitReveal';

/** Cabeçalho claro das páginas interiores: etiqueta, título com marcador, texto e manchas de luz. */
export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-background pt-36 pb-14 sm:pt-44 sm:pb-20">
      <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-56 -right-40 h-[36rem] w-[36rem] rounded-full bg-brand-200/70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-24 -left-48 h-80 w-80 rounded-full bg-brand-100 blur-3xl" />

      <div className="container-x relative">
        <span data-reveal="fade" className="eyebrow">
          {eyebrow}
        </span>
        <SplitReveal as="h1" immediate delay={0.15} className="display-xl mt-6 max-w-5xl text-balance text-ink">
          {title}
        </SplitReveal>
        {text && (
          <p data-reveal className="mt-6 max-w-2xl text-lg leading-relaxed text-tertiary">
            {text}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
