'use client';

import { ArrowUpRight, Pause, Play } from 'lucide-react';
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

export interface HeroChip {
  value: string;
  label: string;
}

const isExternal = (url?: string | null) => !!url && /^https?:\/\//.test(url);
const plain = (t: string) => t.replace(/\*/g, '');

/**
 * Hero centrado: título grande no topo e, por baixo, uma janela panorâmica de imagem
 * que se abre até à largura total com o scroll. Os destaques trocam com uma cortina vertical.
 */
export function HeroSlider({
  slides,
  eyebrow,
  secondary,
  chips = [],
}: {
  slides: HeroSlideData[];
  eyebrow?: string;
  secondary?: { href: string; label: string };
  chips?: HeroChip[];
}) {
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hidden, setHidden] = useState(false);
  const prev = useRef(0);
  const busy = useRef(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const slide = slides[index];
  // Mesmo texto em todos (só mudam as fotos): o texto fica parado e só a imagem troca.
  const sameCopy = slides.every((s) => s.title === slides[0].title && s.description === slides[0].description && s.link === slides[0].link);

  /** Sai o texto atual e só depois troca (a entrada anima no efeito abaixo). */
  const go = useCallback(
    (next: number) => {
      const target = ((next % count) + count) % count;
      if (target === index || busy.current) return;
      if (sameCopy || prefersReducedMotion() || !copy.current) return setIndex(target);
      busy.current = true;
      gsap.to(copy.current.querySelectorAll('[data-copy]'), {
        yPercent: -30,
        opacity: 0,
        duration: 0.35,
        stagger: 0.03,
        ease: 'power2.in',
        onComplete: () => {
          busy.current = false;
          setIndex(target);
        },
      });
    },
    [count, index, sameCopy]
  );

  // Entrada e scroll: a janela sobe, depois abre até às margens enquanto se desce.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('[data-hero-stage]', { y: 80, opacity: 0, duration: 1.6 }, 0.3)
          .from('[data-hero-zoom]', { scale: 1.2, duration: 2.2 }, 0.3)
          .from('[data-hero-rule]', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.1)
          .from('[data-hero-ui]', { y: 16, opacity: 0, duration: 0.8, stagger: 0.05 }, 1.1)
          .from('[data-hero-chip]', { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 1.2);

        // Janela: das margens do conteúdo até à largura total do ecrã (margem medida no contentor do texto).
        const inset = () => {
          const c = root.current?.querySelector<HTMLElement>('[data-hero-copywrap]');
          return c ? c.getBoundingClientRect().left + parseFloat(getComputedStyle(c).paddingLeft) : 16;
        };
        gsap.fromTo(
          '[data-hero-stage]',
          { clipPath: () => `inset(0px ${inset()}px 0px ${inset()}px round 24px)` },
          {
            clipPath: 'inset(0px 0px 0px 0px round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: '+=55%', scrub: 0.6, invalidateOnRefresh: true },
          }
        );
        gsap.to('[data-hero-drift]', { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '[data-hero-stage]', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.to('[data-hero-copywrap]', { yPercent: -20, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '45% top', scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // Rato: a imagem acompanha o cursor com um atraso suave (só com rato).
  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current;
      if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el).map((node) => ({
        depth: Number(node.dataset.depth),
        x: gsap.quickTo(node, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(node, 'y', { duration: 1.2, ease: 'power3.out' }),
      }));
      const move = contextSafe!((e: PointerEvent) => {
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(px * l.depth);
          l.y(py * l.depth);
        });
      });
      window.addEventListener('pointermove', move);
      return () => window.removeEventListener('pointermove', move);
    },
    { scope: root }
  );

  // Troca de destaque: cortina vertical na imagem + Ken Burns; título palavra a palavra.
  useGSAP(
    () => {
      const imgs = gsap.utils.toArray<HTMLElement>('[data-slide-img]', root.current);
      const current = imgs[index];
      const old = imgs[prev.current];
      const reduced = prefersReducedMotion();
      imgs.forEach((el, i) => gsap.set(el, { zIndex: i === index ? 2 : i === prev.current ? 1 : 0, autoAlpha: i === index || i === prev.current ? 1 : 0 }));

      let split: SplitText | undefined;
      const title = copy.current?.querySelector<HTMLElement>('[data-copy-title]');
      const rest = copy.current?.querySelectorAll('[data-copy]:not([data-copy-title])') ?? [];
      if (reduced) {
        if (old && old !== current) gsap.set(old, { autoAlpha: 0 });
        gsap.set([title, ...rest], { opacity: 1, yPercent: 0, visibility: 'visible' });
        prev.current = index;
        return;
      }

      const tl = gsap.timeline();
      if (current) {
        if (old && old !== current) {
          tl.fromTo(current, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0);
          tl.to(old.querySelector('[data-kb]'), { yPercent: -12, duration: 1.3, ease: 'expo.inOut' }, 0);
          tl.set(old, { autoAlpha: 0 });
          tl.set(old.querySelector('[data-kb]'), { yPercent: 0 });
        }
        tl.fromTo(current.querySelector('[data-kb]'), { scale: 1.22 }, { scale: 1.04, duration: DURATION + 1.3, ease: 'power1.out' }, 0);
      }
      // Com o mesmo texto em todos os destaques, só anima o texto na primeira entrada.
      const animateCopy = !sameCopy || !old || old === current;
      if (title && !animateCopy) gsap.set([title, ...rest], { opacity: 1, yPercent: 0, visibility: 'visible' });
      if (title && animateCopy) {
        gsap.set([title, ...rest], { opacity: 1, yPercent: 0, visibility: 'visible' });
        split = SplitText.create(title, { type: 'words,lines', mask: 'lines', linesClass: 'split-line' });
        tl.from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.045, ease: 'expo.out' }, 0.1);
        tl.fromTo(title, { '--hl': '0%' }, { '--hl': '100%', duration: 1, ease: 'expo.inOut' }, 0.6);
        tl.from(rest, { yPercent: 40, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.35);
      }
      prev.current = index;
      return () => split?.revert();
    },
    { scope: root, dependencies: [index] }
  );

  // Progresso e avanço automático.
  useGSAP(
    () => {
      if (count < 2) return;
      gsap.set('[data-progress]', { scaleX: 0 });
      const bar = root.current?.querySelector(`[data-progress="${index}"]`);
      const tween = gsap.fromTo(bar ?? {}, { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: 'none', onComplete: () => go(index + 1) });
      if (stopped || hidden || prefersReducedMotion()) tween.pause();
      return () => {
        tween.kill();
      };
    },
    { scope: root, dependencies: [index, stopped, hidden, count, go] }
  );

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (!count || !slide) return null;
  const Title = index === 0 ? 'h1' : 'h2';

  return (
    <section
      ref={root}
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative overflow-clip bg-white pt-32 sm:pt-40"
      style={{ '--hero-inset': 'max(var(--gutter), calc((100% - 80rem) / 2 + var(--gutter)))' } as React.CSSProperties}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50 && count > 1) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Texto: título à esquerda, apoio e ações à direita, separados por um filete */}
      <div data-hero-copywrap className="container-x relative">
        <div ref={copy} key={sameCopy ? 'copy' : slide.id} className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            {eyebrow && (
              <span data-copy className="eyebrow">
                {eyebrow}
              </span>
            )}
            <Title data-copy data-copy-title className="mt-6 font-head text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance text-ink" style={{ visibility: 'hidden' }}>
              <Accent text={slide.title} />
            </Title>
          </div>
          <div className="lg:col-span-5 lg:pb-3">
            {slide.description && (
              <p data-copy className="max-w-md text-lg leading-relaxed text-tertiary">
                {slide.description}
              </p>
            )}
            <div data-copy className="mt-7 flex flex-wrap gap-3">
              {slide.link && (
                <Link href={slide.link} target={isExternal(slide.link) ? '_blank' : undefined} className="btn btn-dark">
                  {slide.buttonText || 'Saber mais'} <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
              {secondary && (
                <Link href={secondary.href} className="btn btn-outline-dark">
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
        <span aria-hidden data-hero-rule className="mt-12 block h-px origin-left bg-line sm:mt-16" />
      </div>

      {/* Janela panorâmica */}
      <div
        data-hero-stage
        className="relative mt-8 h-[62svh] min-h-[24rem] overflow-hidden bg-brand-100 sm:mt-10 lg:h-[82svh]"
        style={{ clipPath: 'inset(0% var(--hero-inset) 0% var(--hero-inset) round 24px)' }}
      >
        <div data-hero-zoom className="absolute inset-0 origin-top">
          <div data-depth="-24" data-hero-drift className="absolute -inset-8 origin-top">
            {slides.map((s, i) => (
              <div key={s.id} data-slide-img aria-hidden={i !== index} className="absolute inset-0 overflow-hidden" style={{ visibility: i === 0 ? 'visible' : 'hidden' }}>
                <div data-kb className="absolute inset-0">
                  {s.imageUrl ? <Img src={s.imageUrl} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" /> : <HeroArt />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />

        {/* Números em vidro, canto superior */}
        {chips.length > 0 && (
          <div className="absolute top-5 right-[calc(var(--hero-inset)+1.25rem)] z-[4] hidden gap-3 sm:flex lg:top-8">
            {chips.slice(0, 2).map((c) => (
              <div key={c.label} data-hero-chip className="rounded-2xl bg-white/80 px-5 py-4 shadow-[0_20px_40px_-24px_rgb(8_43_71/0.6)] ring-1 ring-white/60 backdrop-blur-md">
                <span className="block font-head text-2xl leading-none font-semibold tracking-tight text-ink tabular-nums">{c.value}</span>
                <span className="mt-1.5 block max-w-[11rem] text-xs text-tertiary">{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Separadores dos destaques */}
        {count > 1 && (
          <div className="container-x absolute inset-x-0 bottom-0 z-[4] pb-6 sm:pb-10">
            <div className="flex items-end gap-3 sm:gap-4">
              <button
                data-hero-ui
                type="button"
                onClick={() => setStopped((v) => !v)}
                aria-label={stopped ? 'Retomar a passagem automática' : 'Pausar a passagem automática'}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition-colors hover:bg-white"
              >
                {stopped ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
              </button>
              <ol className="grid flex-1 gap-3 sm:gap-5" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
                {slides.map((s, i) => (
                  <li key={s.id}>
                    <button
                      data-hero-ui
                      type="button"
                      onClick={() => go(i)}
                      aria-label={sameCopy ? `Mostrar a fotografia ${i + 1}` : `Ir para o destaque ${i + 1}: ${plain(s.title)}`}
                      aria-current={i === index}
                      className="group flex min-h-11 w-full flex-col justify-end gap-2.5 text-left text-white"
                    >
                      <span className={`hidden text-sm leading-snug font-medium transition-opacity duration-500 ${sameCopy ? '' : 'md:line-clamp-2'} ${i === index ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                        <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        {plain(s.title)}
                      </span>
                      <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/30">
                        <span data-progress={i} className={`absolute inset-0 origin-left rounded-full ${i < index ? 'bg-white/70' : 'bg-white'}`} style={{ transform: 'scaleX(0)' }} />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Composição gráfica quando ainda não há fotografia no painel. */
function HeroArt() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-200 via-brand-400 to-brand-700">
      <div className="dots-white absolute inset-0 opacity-50" />
      {[110, 85, 60, 35].map((size, i) => (
        <div key={size} className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" style={{ width: `${size}%`, aspectRatio: '1', opacity: 0.35 + i * 0.15 }} />
      ))}
    </div>
  );
}
