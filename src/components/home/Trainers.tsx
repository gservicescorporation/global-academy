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
    <Tilt className="group relative h-full overflow-hidden rounded-[1.75rem] bg-paper ring-1 ring-line">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        {t.photoUrl ? (
          <Img
            src={t.photoUrl}
            alt={`Fotografia de ${t.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover grayscale transition duration-700 ease-out-expo group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 flex items-center justify-center">
            <div className="grid-lines absolute inset-0" />
            <div className="absolute -right-1/3 -bottom-1/3 h-full w-full rounded-full bg-royal/40 blur-3xl" />
            <span className="serif-accent relative text-6xl text-white/80 sm:text-8xl">{initials(t.name)}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
          <h3 className="text-base font-semibold tracking-tight sm:text-xl">{t.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-white/70 sm:text-sm">{t.role}</p>
        </div>
      </div>
      {t.bio && (
        <div className="hidden p-6 sm:block">
          <p className="line-clamp-4 text-sm leading-relaxed text-tertiary">{t.bio}</p>
        </div>
      )}
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
            <span data-reveal="fade" className="eyebrow text-royal">
              Formadores
            </span>
            <SplitReveal className="display-lg mt-6 text-balance text-ink">
              <Accent text={title} className="serif-accent text-royal" />
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
