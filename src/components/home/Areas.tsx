import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';

/** Áreas de formação (a partir do campo "Área" de cada curso). */
export function Areas({ areas, title, text }: { areas: { name: string; count: number }[]; title: string; text?: string }) {
  if (areas.length === 0) return null;
  return (
    <section className="section-y bg-paper">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <span data-reveal="fade" className="eyebrow text-royal">
            Áreas de formação
          </span>
          <SplitReveal className="display-lg mt-6 text-balance text-ink">
            <Accent text={title} className="serif-accent text-royal" />
          </SplitReveal>
          {text && (
            <p data-reveal className="mt-6 max-w-sm text-lg text-tertiary">
              {text}
            </p>
          )}
        </div>
        <ul className="border-t border-line lg:col-span-8">
          {areas.map((a, i) => (
            <li key={a.name} data-reveal="up" data-reveal-delay={i * 0.04} className="border-b border-line">
              <Link
                href={`/cursos?area=${encodeURIComponent(a.name)}`}
                className="group flex min-h-24 items-center gap-6 py-6 transition-colors sm:gap-10"
              >
                <span className="w-8 text-sm text-tertiary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="relative flex-1 overflow-hidden text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.25] font-semibold tracking-tight text-ink">
                  <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{a.name}</span>
                  <span aria-hidden className="serif-accent absolute inset-0 block translate-y-full text-royal transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
                    {a.name}
                  </span>
                </span>
                <span className="hidden text-sm text-tertiary sm:block">
                  {a.count} {a.count === 1 ? 'curso' : 'cursos'}
                </span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition-colors duration-500 group-hover:bg-ink group-hover:text-white group-hover:ring-ink">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
