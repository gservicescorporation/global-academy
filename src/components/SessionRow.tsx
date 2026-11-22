import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { SessionWithSeats } from '@/lib/queries';
import { formatPrice, formatRange } from '@/lib/utils';

/** Linha do calendário: data, curso, local, vagas e inscrição. */
export function SessionRow({ s, tone = 'light' }: { s: SessionWithSeats; tone?: 'light' | 'dark' }) {
  const r = formatRange(s.startDate, s.endDate);
  const full = s.remaining === 0;
  const few = !full && s.remaining <= 5;
  const dark = tone === 'dark';
  const year = s.startDate.slice(0, 4);

  return (
    <article
      className={`group relative grid items-center gap-5 rounded-[1.75rem] p-5 ring-1 transition-colors duration-500 sm:grid-cols-[auto_1fr] md:grid-cols-[auto_1.6fr_1fr_auto] md:gap-8 md:p-6 ${
        dark ? 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]' : 'bg-paper ring-line hover:ring-ink/20'
      }`}
    >
      <time
        dateTime={s.startDate}
        className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl leading-none ${dark ? 'bg-accent text-ink' : 'bg-ink text-white'}`}
      >
        <b className="text-xl font-bold tracking-tight">{r.days}</b>
        <span className="mt-1.5 text-[11px] font-semibold tracking-wide uppercase">{r.month.slice(0, 3)} {year}</span>
      </time>

      <div>
        <h3 className={`text-xl leading-snug font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
          <Link href={`/cursos/${s.course?.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {s.course?.title}
          </Link>
        </h3>
        <p className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-tertiary'}`}>
          {r.full} · {s.location ?? 'Presencial'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-2 md:col-span-1">
        <span className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-white' : 'text-ink'}`}>
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ring-4 ${full ? 'bg-red-500 ring-red-500/15' : few ? 'bg-gold ring-gold/20' : 'bg-green-500 ring-green-500/20'}`}
          />
          {full ? 'Esgotado' : `${s.remaining} ${s.remaining === 1 ? 'vaga' : 'vagas'}`}
        </span>
        {s.course && (
          <span className={`text-sm ${dark ? 'text-white/60' : 'text-tertiary'}`}>{formatPrice(s.course.price, s.course.currency)}</span>
        )}
      </div>

      <span
        aria-hidden
        className={`hidden h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 md:flex ${
          dark ? 'bg-white text-ink group-hover:bg-accent' : 'bg-ink text-white group-hover:bg-royal'
        }`}
      >
        <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
      </span>
    </article>
  );
}
