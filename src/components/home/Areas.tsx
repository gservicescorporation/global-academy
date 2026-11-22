import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';

/** Áreas de formação (a partir do campo "Área" de cada curso). */
export function Areas({ areas, title, text }: { areas: { name: string; count: number }[]; title: string; text?: string }) {
  if (areas.length === 0) return null;
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span data-reveal="fade" className="eyebrow">
              Áreas de formação
            </span>
            <SplitReveal className="display-lg mt-6 text-balance text-ink">
              <Accent text={title} />
            </SplitReveal>
          </div>
          {text && (
            <p data-reveal className="max-w-sm text-lg text-tertiary">
              {text}
            </p>
          )}
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2">
          {areas.map((a, i) => (
            <li key={a.name} data-reveal="up" data-reveal-delay={(i % 2) * 0.06}>
              <Link
                href={`/cursos?area=${encodeURIComponent(a.name)}`}
                className="group relative flex min-h-28 items-center gap-5 overflow-hidden rounded-[1.75rem] bg-brand-50 p-6 ring-1 ring-line transition-colors duration-500 hover:text-white sm:p-8"
              >
                {/* Preenchimento azul que sobe a partir de baixo no hover */}
                <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 rounded-[inherit] bg-brand-600 transition-transform duration-500 ease-out-expo group-hover:scale-y-100" />
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white font-head text-lg font-bold text-brand-700 transition-transform duration-700 ease-out-expo group-hover:rotate-[-8deg]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-head text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">{a.name}</span>
                  <span className="mt-1 block text-sm text-tertiary transition-colors duration-500 group-hover:text-white">
                    {a.count} {a.count === 1 ? 'curso disponível' : 'cursos disponíveis'}
                  </span>
                </span>
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
