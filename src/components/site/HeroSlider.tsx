'use client';

import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '../motion/gsap';
import { Accent } from './Accent';
import { Img } from './Img';

const DURATION = 7; // segundos por destaque

export interface HeroSlideData {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  link?: string | null;
  buttonText?: string | null;
}

const isExternal = (url?: string | null) => !!url && /^https?:\/\//.test(url);

export function HeroSlider({
  slides,
  eyebrow,
  secondary,
}: {
  slides: HeroSlideData[];
  eyebrow?: string;
  secondary?: { href: string; label: string };
}) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [hidden, setHidden] = useState(false);
  const prev = useRef(0);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const paused = hovered || stopped || hidden;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Entrada da interface + parallax de saída ao fazer scroll.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-hero-ui]', { y: 30, opacity: 0, stagger: 0.08, duration: 1.2, delay: 0.5 });
      gsap.to('[data-hero-content]', {
        yPercent: -25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 30%', scrub: true },
      });
      gsap.to('[data-hero-media]', {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: root }
  );

  // Transição entre destaques: cortina em clip-path, Ken Burns e título linha a linha.
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>('[data-slide]', root.current);
      const current = els[index];
      const old = els[prev.current];
      if (!current) return;

      els.forEach((el, i) => {
        if (i !== index && i !== prev.current) gsap.set(el, { autoAlpha: 0, zIndex: 0 });
      });

      if (prefersReducedMotion()) {
        gsap.set(current, { autoAlpha: 1, zIndex: 2 });
        if (old && old !== current) gsap.set(old, { autoAlpha: 0, zIndex: 0 });
        prev.current = index;
        return;
      }

      const img = current.querySelector('[data-slide-img]');
      const title = current.querySelector<HTMLElement>('[data-slide-title]');
      const rest = current.querySelectorAll('[data-slide-fade]');
      const changing = old && old !== current;

      const tl = gsap.timeline();
      if (changing) {
        gsap.set(old, { zIndex: 1 });
        tl.to(old.querySelectorAll('[data-slide-title], [data-slide-fade]'), {
          y: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.in',
        });
      }
      tl.set(current, { autoAlpha: 1, zIndex: 2 });
      tl.fromTo(current, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'expo.inOut' }, changing ? '-=0.15' : 0);
      if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: DURATION + 1.5, ease: 'power1.out' }, '<');

      let split: SplitText | undefined;
      if (title) {
        gsap.set([title, ...rest], { opacity: 1, y: 0 });
        split = SplitText.create(title, { type: 'words,lines', mask: 'lines', linesClass: 'split-line' });
        tl.from(split.lines, { yPercent: 115, duration: 1.2, stagger: 0.09 }, '<0.55');
        tl.from(rest, { y: 24, opacity: 0, stagger: 0.08, duration: 1 }, '<0.25');
      }
      if (changing) tl.set(old, { autoAlpha: 0, zIndex: 0 });

      prev.current = index;
      return () => split?.revert();
    },
    { scope: root, dependencies: [index] }
  );

  // Barra de progresso e avanço automático.
  useGSAP(
    () => {
      if (count < 2) return;
      gsap.set('[data-progress]', { scaleX: 0 });
      const bar = root.current?.querySelector(`[data-progress="${index}"]`);
      const tween = gsap.fromTo(bar ?? {}, { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: 'none', onComplete: () => go(index + 1) });
      if (paused || prefersReducedMotion()) tween.pause();
      return () => {
        tween.kill();
      };
    },
    { scope: root, dependencies: [index, paused, count] }
  );

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (!count) return null;

  return (
    <section
      ref={root}
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink text-white"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50 && count > 1) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div data-hero-media className="absolute inset-0">
        {slides.map((s, i) => {
          const Title = i === 0 ? 'h1' : 'h2';
          return (
            <div
              key={s.id}
              data-slide
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="destaque"
              aria-label={`${i + 1} de ${count}`}
              className="absolute inset-0"
              style={{ visibility: i === 0 ? 'visible' : 'hidden', zIndex: i === 0 ? 2 : 0 }}
            >
              <div data-slide-img className="absolute inset-0">
                {s.imageUrl ? (
                  <Img src={s.imageUrl} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
                ) : (
                  <HeroArt />
                )}
              </div>
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(100deg, rgb(7 11 22 / 0.92) 0%, rgb(7 11 22 / 0.65) 45%, rgb(7 11 22 / 0.2) 100%)' }}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />

              <div data-hero-content className="container-x relative flex h-full flex-col justify-end pt-32 pb-44 sm:justify-center sm:pb-28">
                <div className="max-w-4xl">
                  {eyebrow && (
                    <span data-slide-fade className="eyebrow text-accent">
                      {eyebrow}
                    </span>
                  )}
                  <Title
                    data-slide-title
                    className="display-xl mt-5 text-balance"
                    style={{ fontSize: s.title.length > 48 ? 'clamp(2.2rem, 5.6vw, 5.25rem)' : undefined }}
                  >
                    <Accent text={s.title} className="serif-accent text-white/70" />
                  </Title>
                  {s.description && (
                    <p data-slide-fade className="mt-6 line-clamp-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                      {s.description}
                    </p>
                  )}
                  {(s.link || secondary) && (
                    <div data-slide-fade className="mt-9 flex flex-wrap gap-3">
                      {s.link && (
                        <Link href={s.link} target={isExternal(s.link) ? '_blank' : undefined} className="btn btn-light">
                          {s.buttonText || 'Saber mais'} <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </Link>
                      )}
                      {secondary && (
                        <Link href={secondary.href} className="btn btn-outline-light">
                          {secondary.label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="container-x flex items-end justify-between gap-4 pb-8">
          {count > 1 ? (
            <div className="flex flex-1 items-end gap-4 sm:max-w-3xl">
              <button
                data-hero-ui
                type="button"
                onClick={() => setStopped((v) => !v)}
                aria-label={stopped ? 'Retomar a passagem automática' : 'Pausar a passagem automática'}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-white/25 transition-colors hover:bg-white hover:text-ink"
              >
                {stopped ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              </button>
              <div
                className="grid flex-1 gap-3"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    data-hero-ui
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Ir para o destaque ${i + 1}: ${s.title.replace(/\*/g, '')}`}
                    aria-current={i === index}
                    className="group flex min-h-11 flex-col justify-end gap-3 pt-3 text-left"
                  >
                    <span className="relative h-[2px] w-full overflow-hidden bg-white/20">
                      <span
                        data-progress={i}
                        className={`absolute inset-0 origin-left ${i < index ? 'bg-white/60' : 'bg-accent'}`}
                        style={{ transform: 'scaleX(0)' }}
                      />
                    </span>
                    <span
                      className={`hidden text-xs leading-snug transition-colors sm:line-clamp-1 ${
                        i === index ? 'text-white' : 'text-white/45 group-hover:text-white/80'
                      }`}
                    >
                      <span className="mr-2 tabular-nums">0{i + 1}</span>
                      {s.title.replace(/\*/g, '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <span />
          )}
          <a
            href="#a-seguir"
            data-hero-ui
            aria-label="Descer para o conteúdo"
            className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ring-white/25 transition-colors hover:bg-white hover:text-ink md:flex"
          >
            <ArrowDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden />
          </a>
        </div>
      </div>
      <span id="a-seguir" className="absolute bottom-0" />
    </section>
  );
}

/** Fundo gráfico quando ainda não há fotografia no painel. */
function HeroArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <div aria-hidden className="grid-lines absolute inset-0" />
      <div aria-hidden className="absolute -top-1/4 right-[-10%] h-[70vmax] w-[70vmax] rounded-full bg-royal/40 blur-[120px]" />
      <div aria-hidden className="absolute bottom-[-30%] left-[20%] h-[50vmax] w-[50vmax] rounded-full bg-accent/15 blur-[140px]" />
    </div>
  );
}
