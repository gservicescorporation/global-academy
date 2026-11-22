import SplitReveal from '../motion/SplitReveal';
import Tilt from '../motion/Tilt';
import { Accent } from '../site/Accent';
import { Img } from '../site/Img';
import type { Trainer } from '@/lib/entities';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function TrainerCard({ t }: { t: Trainer }) {
  return (
    <Tilt className="group relative h-full rounded-[1.75rem] bg-white p-3 ring-1 ring-line transition-shadow duration-500 hover:shadow-lift">
      {/* Fotografia em arco */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.25rem] bg-brand-100">
        {t.photoUrl ? (
          <Img
            src={t.photoUrl}
            alt={`Fotografia de ${t.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-700 ease-out-expo group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-brand-100 to-brand-300">
            <div className="dots absolute inset-0 opacity-70" />
            <span className="relative mb-[18%] font-head text-5xl font-semibold tracking-tight text-white sm:text-7xl">{initials(t.name)}</span>
          </div>
        )}
      </div>
      <div className="px-2 pt-4 pb-2 sm:px-3">
        <h3 className="font-head text-base leading-tight font-semibold tracking-tight text-ink sm:text-xl">{t.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-brand-700 sm:text-sm">{t.role}</p>
        {t.bio && <p className="mt-3 hidden text-sm leading-relaxed text-tertiary sm:line-clamp-3">{t.bio}</p>}
      </div>
    </Tilt>
  );
}

export function Trainers({ trainers, title, text }: { trainers: Trainer[]; title: string; text?: string }) {
  if (trainers.length === 0) return null;
  const list = trainers.slice(0, 8);
  return (
    <section className="section-y bg-background">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span data-reveal="fade" className="eyebrow">
              Formadores
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
        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4" style={{ perspective: '1200px' }}>
          {list.map((t, i) => (
            <li key={t.id} data-reveal="up" data-reveal-delay={(i % 4) * 0.06}>
              <TrainerCard t={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
