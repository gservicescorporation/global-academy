'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from './motion/gsap';
import { Img } from './site/Img';

const SIZES = '(min-width: 1024px) 50vw, 100vw';

/** Crossfade simples entre imagens, usado em cartões. */
export function DiffImageSwiper({ images, interval = 3500 }: { images: string[]; interval?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || images.length <= 1 || prefersReducedMotion()) return;
      const slides = gsap.utils.toArray<HTMLElement>('[data-diff-slide]', root);
      slides.forEach((slide, i) => gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 }));

      const timer = gsap.delayedCall(interval / 1000, function tick() {
        const current = indexRef.current;
        const next = (current + 1) % slides.length;
        gsap.to(slides[current], { autoAlpha: 0, duration: 0.9, ease: 'power2.out' });
        gsap.to(slides[next], { autoAlpha: 1, duration: 0.9, ease: 'power2.out' });
        indexRef.current = next;
        timer.restart(true);
      });

      return () => timer.kill();
    },
    { scope: rootRef, dependencies: [images.length, interval] }
  );

  if (images.length === 0) return null;
  if (images.length === 1) {
    return <Img src={images[0]} alt="" fill sizes={SIZES} className="object-cover" />;
  }

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden">
      {images.map((src) => (
        <div key={src} data-diff-slide className="absolute inset-0 h-full w-full">
          <Img src={src} alt="" fill sizes={SIZES} className="object-cover" />
        </div>
      ))}
    </div>
  );
}
