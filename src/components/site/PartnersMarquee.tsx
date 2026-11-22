import Marquee from '../motion/Marquee';
import { Img } from './Img';

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string | null;
}

/** Faixa infinita de empresas: acelera e inverte com o scroll. Sem empresas no painel, não aparece. */
export function PartnersMarquee({ items, title }: { items: PartnerItem[]; title: string; tone?: 'light' | 'dark' }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const rows = items.length > 8 ? [items.slice(0, half), items.slice(half)] : [items];
  const fill = (row: PartnerItem[]) => (row.length < 6 ? [...row, ...row, ...row] : row);

  return (
    <section className="section-y overflow-hidden bg-white" aria-label={title}>
      <div className="container-x mb-10 text-center">
        <h2 data-reveal="fade" className="eyebrow">
          {title}
        </h2>
      </div>
      <ul className="sr-only">
        {items.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-4" aria-hidden>
        {rows.map((row, r) => (
          <Marquee key={r} speed={40 + r * 10} reverse={r % 2 === 1} className="mask-fade-x">
            {fill(row).map((p, i) => (
              <div key={`${p.id}-${i}`} className="mx-2 flex h-20 min-w-44 items-center justify-center rounded-full bg-brand-50 px-8 ring-1 ring-line sm:mx-3 sm:h-24 sm:min-w-56">
                {p.logoUrl ? (
                  <Img src={p.logoUrl} alt="" width={240} height={120} sizes="240px" className="h-10 w-auto object-contain opacity-80 transition-opacity duration-500 hover:opacity-100 sm:h-12" />
                ) : (
                  <span className="font-head text-lg font-semibold tracking-tight whitespace-nowrap text-brand-800 sm:text-xl">{p.name}</span>
                )}
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
