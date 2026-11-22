import { Check } from 'lucide-react';
import { DiffImageSwiper } from '../DiffImageSwiper';
import Parallax from '../motion/Parallax';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';

/** Como são as sessões: imagem com parallax (se houver fotos no painel) + título, texto e pontos. */
export function Approach({ title, text, bullets, images }: { title: string; text?: string; bullets: string[]; images: string[] }) {
  const heading = (
    <>
      <span data-reveal="fade" className="eyebrow text-royal">
        Como são as sessões
      </span>
      <SplitReveal className="display-lg mt-6 text-balance text-ink">
        <Accent text={title} className="serif-accent text-royal" />
      </SplitReveal>
      {text && (
        <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-tertiary">
          {text}
        </p>
      )}
    </>
  );

  if (images.length === 0) {
    return (
      <section className="section-y bg-background">
        <div className="container-x">
          <div className="max-w-4xl">{heading}</div>
          {bullets.length > 0 && (
            <ul className="mt-14 grid gap-4 md:grid-cols-3">
              {bullets.map((b, i) => (
                <li key={b} data-reveal="up" data-reveal-delay={i * 0.06} className="flex flex-col gap-6 rounded-[1.75rem] bg-paper p-8 ring-1 ring-line">
                  <span className="text-sm font-semibold text-royal tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xl leading-snug font-semibold tracking-tight text-ink">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="section-y bg-background">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div data-reveal="clip" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink sm:aspect-[5/4] lg:col-span-6 lg:aspect-[4/5]">
          <Parallax className="absolute inset-0" speed={8} scale={1.15}>
            <div className="absolute inset-0">
              <DiffImageSwiper images={images} />
            </div>
          </Parallax>
        </div>
        <div className="lg:col-span-6">
          {heading}
          {bullets.length > 0 && (
            <ul className="mt-10 grid gap-4">
              {bullets.map((b, i) => (
                <li key={b} data-reveal="up" data-reveal-delay={i * 0.05} className="flex items-start gap-4 border-t border-line pt-4 text-ink">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-lg">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
