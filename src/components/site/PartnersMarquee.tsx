import Marquee from '../motion/Marquee';
import { Img } from './Img';

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string | null;
}

/** Faixa infinita de empresas: acelera e inverte com o scroll. Sem empresas no painel, não aparece. */
export function PartnersMarquee({ items, title, tone = 'light' }: { items: PartnerItem[]; title: string; tone?: 'light' | 'dark' }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const rows = items.length > 8 ? [items.slice(0, half), items.slice(half)] : [items];
  // Com poucos nomes, repete-os para a faixa preencher ecrãs largos.
  const fill = (row: PartnerItem[]) => (row.length < 6 ? [...row, ...row, ...row] : row);
  const dark = tone === 'dark';

  return (
    <section className={`section-y overflow-hidden ${dark ? 'bg-ink text-white' : 'bg-paper'}`} aria-label={title}>
      <div className="container-x mb-12 flex items-center gap-6">
        <h2 data-reveal="fade" className={`eyebrow shrink-0 ${dark ? 'text-accent' : 'text-royal'}`}>
          {title}
        </h2>
        <span data-reveal="fade" className={`h-px flex-1 ${dark ? 'bg-white/10' : 'bg-line'}`} />
      </div>
      <ul className="sr-only">
        {items.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-6" aria-hidden>
        {rows.map((row, r) => (
          <Marquee key={r} speed={45 + r * 10} reverse={r % 2 === 1} className="mask-fade-x">
            {fill(row).map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className={`mx-3 flex h-24 w-48 items-center justify-center rounded-2xl px-6 ring-1 sm:mx-4 sm:h-28 sm:w-60 ${
                  dark ? 'bg-white/5 ring-white/10' : 'bg-background ring-line'
                }`}
              >
                {p.logoUrl ? (
                  <Img
                    src={p.logoUrl}
                    alt=""
                    width={240}
                    height={120}
                    sizes="240px"
                    className="h-12 w-auto object-contain opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 sm:h-14"
                  />
                ) : (
                  <span className={`text-center text-lg font-semibold tracking-tight ${dark ? 'text-white/60' : 'text-tertiary'}`}>{p.name}</span>
                )}
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
