import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { SessionWithSeats } from '@/lib/queries';
import { formatPrice, formatRange } from '@/lib/utils';

/** Linha do calendário: data, curso, local, vagas (com barra de ocupação) e inscrição. */
export function SessionRow({ s }: { s: SessionWithSeats; tone?: 'light' | 'dark' }) {
  const r = formatRange(s.startDate, s.endDate);
  const full = s.remaining === 0;
  const few = !full && s.remaining <= 5;
  const year = s.startDate.slice(0, 4);
  const taken = Math.max(0, s.seats - s.remaining);
  const pct = s.seats ? Math.round((taken / s.seats) * 100) : 0;

  return (
    <article className="group relative grid items-center gap-5 rounded-[1.75rem] bg-white p-4 ring-1 ring-line transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-lift sm:grid-cols-[auto_1fr] sm:p-5 md:grid-cols-[auto_1.6fr_1fr_auto] md:gap-8">
      <time dateTime={s.startDate} className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-brand-100 leading-none text-brand-800 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-white">
        <b className="font-head text-xl font-semibold tracking-tight">{r.days}</b>
        <span className="mt-1.5 text-[11px] font-semibold tracking-wide uppercase">
          {r.month.slice(0, 3)} {year}
        </span>
      </time>

      <div className="min-w-0">
        <h3 className="font-head text-xl leading-snug font-semibold tracking-tight text-ink">
          <Link href={`/cursos/${s.course?.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {s.course?.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-tertiary">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> {r.full} · {s.location ?? 'Presencial'}
        </p>
      </div>

      <div className="sm:col-span-2 md:col-span-1">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={`font-semibold ${full ? 'text-red-700' : few ? 'text-amber-700' : 'text-ink'}`}>
            {full ? 'Esgotado' : `${s.remaining} ${s.remaining === 1 ? 'vaga' : 'vagas'}`}
          </span>
          {s.course && <span className="text-tertiary">{formatPrice(s.course.price, s.course.currency)}</span>}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100" aria-hidden>
          <div className={`h-full rounded-full ${full ? 'bg-red-500' : few ? 'bg-gold' : 'bg-brand-500'}`} style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
      </div>

      <span aria-hidden className="hidden h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-white md:flex">
        <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
      </span>
    </article>
  );
}
