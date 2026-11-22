import { Check } from 'lucide-react';
import { DiffImageSwiper } from '../DiffImageSwiper';
import Parallax from '../motion/Parallax';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';

/** Como são as sessões: imagem com parallax (se houver fotos no painel) + título, texto e pontos. */
export function Approach({ title, text, bullets, images }: { title: string; text?: string; bullets: string[]; images: string[] }) {
  const heading = (
    <>
      <span data-reveal="fade" className="eyebrow">
        Como são as sessões
      </span>
      <SplitReveal className="display-lg mt-6 text-balance text-ink">
        <Accent text={title} />
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
          <div className="max-w-3xl">{heading}</div>
          {bullets.length > 0 && (
            <ul className="mt-14 grid gap-4 md:grid-cols-3">
              {bullets.map((b, i) => (
                <li
                  key={b}
                  data-reveal="up"
                  data-reveal-delay={i * 0.08}
                  className="group relative flex min-h-56 flex-col justify-between gap-6 overflow-hidden rounded-[1.75rem] bg-white p-8 ring-1 ring-line transition-shadow duration-500 hover:shadow-lift"
                >
                  <span aria-hidden className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-100 transition-transform duration-700 ease-out-expo group-hover:scale-150" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <Check className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="relative font-head text-2xl leading-snug font-semibold tracking-tight text-ink">{b}</span>
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
      <div className="container-x grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="relative lg:col-span-6">
          <div aria-hidden className="absolute -inset-5 rounded-[3rem] border-2 border-dashed border-brand-200" />
          <div data-reveal="clip" className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-brand-100 sm:aspect-[5/4] lg:aspect-[4/5]">
            <Parallax className="absolute inset-0" speed={8} scale={1.15}>
              <div className="absolute inset-0">
                <DiffImageSwiper images={images} />
              </div>
            </Parallax>
          </div>
        </div>
        <div className="lg:col-span-6">
          {heading}
          {bullets.length > 0 && (
            <ul className="mt-10 grid gap-3">
              {bullets.map((b, i) => (
                <li key={b} data-reveal="right" data-reveal-delay={i * 0.06} className="flex items-center gap-4 rounded-2xl bg-white p-4 text-ink ring-1 ring-line">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
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
