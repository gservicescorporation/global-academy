'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { gsap, prefersReducedMotion } from './motion/gsap';

export function CourseGallery({ images }: { images: string[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      setOpenAt(null);
      return;
    }
    gsap.to(overlay, { autoAlpha: 0, duration: 0.3, ease: 'power2.out', onComplete: () => setOpenAt(null) });
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setOpenAt((i) => (i === null ? i : (i + dir + images.length) % images.length));
    },
    [images.length]
  );

  useEffect(() => {
    if (openAt === null) return;
    document.documentElement.classList.add('lenis-stopped');
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [openAt === null, close, go]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (openAt === null || prefersReducedMotion()) return;
    const overlay = overlayRef.current;
    if (overlay && gsap.getProperty(overlay, 'opacity') === 0) {
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
    }
    if (imgRef.current) {
      gsap.fromTo(imgRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
    }
  }, [openAt]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Abrir imagem ${i + 1} de ${images.length}`}
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setOpenAt(i);
            }}
            className="group aspect-[4/3] overflow-hidden rounded-2xl bg-canvas"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out-expo group-hover:scale-105" />
          </button>
        ))}
      </div>

      {openAt !== null && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria — imagem ${openAt + 1} de ${images.length}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-10"
          onClick={close}
          data-lenis-prevent
        >
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar"
            onClick={close}
            className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
          >
            <Icon name="close" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white ring-1 ring-white/15 transition hover:bg-white/20 sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Imagem seguinte"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white ring-1 ring-white/15 transition hover:bg-white/20 sm:right-6"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            key={images[openAt]}
            src={images[openAt]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium tracking-widest text-white/60 tabular-nums">
            {openAt + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
