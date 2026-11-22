import Marquee from '../motion/Marquee';

/** Faixa grande com os nomes dos cursos, alternando cheio e contorno. Decorativa. */
export function TickerBand({ items }: { items: string[] }) {
  const list = items.filter(Boolean);
  if (list.length === 0) return null;
  const fill = list.length < 4 ? [...list, ...list] : list;
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-line bg-white py-6 sm:py-8">
      <Marquee speed={55} className="mask-fade-x">
        {fill.map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center">
            <span className={`px-6 font-head text-4xl font-semibold tracking-tight whitespace-nowrap sm:text-6xl ${i % 2 ? 'text-outline' : 'text-ink'}`}>{t}</span>
            <span className="h-3 w-3 shrink-0 rounded-full bg-brand-400 sm:h-4 sm:w-4" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
