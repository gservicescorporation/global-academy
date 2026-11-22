'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../motion/gsap';

export interface Step {
  title: string;
  text: string;
}

/**
 * Passos ligados por uma linha ondulada (SVG) que se desenha com o scroll.
 * Desktop: onda horizontal; mobile: linha vertical. Cada passo acende quando a linha lhe chega.
 */
export function StepsTimeline({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        const items = gsap.utils.toArray<HTMLElement>('[data-step]');
        if (!motion) {
          items.forEach((el) => el.classList.add('is-active'));
          gsap.set('[data-step-path]', { strokeDashoffset: 0 });
          gsap.set('[data-step-vline]', { scaleY: 1 });
          return;
        }
        const scrub = { trigger: root.current, start: desktop ? 'top 75%' : 'top 80%', end: desktop ? 'bottom 60%' : 'bottom 65%', scrub: 0.8 };
        if (desktop) gsap.fromTo('[data-step-path]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: scrub });
        else gsap.fromTo('[data-step-vline]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: scrub });

        items.forEach((el, i) => {
          ScrollTrigger.create({
            trigger: el,
            start: desktop ? `top ${70 - i * 4}%` : 'top 70%',
            onEnter: () => {
              el.classList.add('is-active');
              gsap.fromTo(el.querySelector('[data-step-dot]'), { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
            },
            onLeaveBack: () => el.classList.remove('is-active'),
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const cols = steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <ol ref={root} className={`relative mt-14 grid gap-8 pl-12 lg:gap-6 lg:pt-20 lg:pl-0 ${cols}`}>
      {/* Desktop: onda */}
      <svg aria-hidden className="pointer-events-none absolute top-0 left-0 hidden h-16 w-full lg:block" viewBox="0 0 1000 64" preserveAspectRatio="none">
        <path d="M0 32 C 125 0, 125 64, 250 32 S 375 0, 500 32 S 625 64, 750 32 S 875 0, 1000 32" fill="none" stroke="var(--color-brand-200)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path
          data-step-path
          d="M0 32 C 125 0, 125 64, 250 32 S 375 0, 500 32 S 625 64, 750 32 S 875 0, 1000 32"
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Mobile: linha vertical */}
      <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-[3px] rounded-full bg-brand-100 lg:hidden" />
      <span aria-hidden data-step-vline className="absolute top-2 bottom-2 left-[19px] w-[3px] origin-top scale-y-0 rounded-full bg-brand-500 lg:hidden" />

      {steps.map((s, i) => (
        <li key={`${s.title}-${i}`} data-step className="group/step relative">
          <span
            data-step-dot
            className="absolute top-0 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-white font-head text-sm font-bold text-brand-400 ring-2 ring-brand-100 transition-colors duration-500 group-[.is-active]/step:bg-brand-600 group-[.is-active]/step:text-white group-[.is-active]/step:ring-brand-200 lg:-top-[3.6rem] lg:left-0"
          >
            {i + 1}
          </span>
          <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line transition-shadow duration-500 group-[.is-active]/step:shadow-lift">
            <h3 className="font-head text-xl font-semibold tracking-tight text-ink">{s.title}</h3>
            <p className="mt-2 text-tertiary">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
