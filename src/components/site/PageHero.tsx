import type { ReactNode } from 'react';
import SplitReveal from '../motion/SplitReveal';
import Parallax from '../motion/Parallax';
import { Img } from './Img';

/** Cabeçalho escuro e compacto das páginas interiores. */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  image?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink pt-40 pb-20 text-white sm:pt-48 sm:pb-28">
      {image ? (
        <Parallax className="absolute inset-0" speed={12} scale={1.15}>
          <div className="absolute inset-0">
            <Img src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
          </div>
        </Parallax>
      ) : (
        <div aria-hidden className="absolute -top-1/3 right-[-15%] h-[60vmax] w-[60vmax] rounded-full bg-royal/35 blur-[130px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/75 to-ink" />
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />

      <div className="container-x relative">
        <span data-reveal="fade" className="eyebrow text-accent">
          {eyebrow}
        </span>
        <SplitReveal as="h1" immediate delay={0.2} className="display-xl mt-6 max-w-5xl text-balance">
          {title}
        </SplitReveal>
        {text && (
          <p data-reveal className="mt-6 max-w-2xl text-lg text-white/65">
            {text}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
