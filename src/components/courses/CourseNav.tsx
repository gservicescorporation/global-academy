'use client';

import { useRef, useState } from 'react';
import { ScrollTrigger, useGSAP } from '../motion/gsap';

/** Sub-navegação fixa da página de curso; marca a secção visível. */
export function CourseNav({ items, cta }: { items: { id: string; label: string }[]; cta: { href: string; label: string } | null }) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    const triggers = items.map((it) =>
      ScrollTrigger.create({
        trigger: `#${it.id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (!self.isActive) return;
          setActive(it.id);
          // Mantém o separador ativo visível no scroll horizontal (mobile).
          listRef.current?.querySelector(`[data-nav="${it.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  });

  return (
    <nav aria-label="Secções do curso" className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
      <div className="container-x flex items-center gap-4">
        <ul ref={listRef} className="no-scrollbar -mx-2 flex flex-1 gap-1 overflow-x-auto py-3">
          {items.map((it) => (
            <li key={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                data-nav={it.id}
                aria-current={active === it.id ? 'location' : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                  active === it.id ? 'bg-brand-600 text-white' : 'text-tertiary hover:bg-background hover:text-ink'
                }`}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
        {cta && (
          <a href={cta.href} className="btn btn-dark hidden shrink-0 py-3 md:inline-flex">
            {cta.label}
          </a>
        )}
      </div>
    </nav>
  );
}
