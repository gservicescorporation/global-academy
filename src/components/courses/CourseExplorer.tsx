'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Flip, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../motion/gsap';
import { refreshReveals } from '../motion/SmoothScroll';

export interface ExplorerItem {
  id: string;
  title: string;
  text: string; // título + descrição + área, em minúsculas e sem acentos
  area: string | null;
  modes: ('presencial' | 'online')[];
  level: string | null;
  status: 'soon' | 'open' | 'done';
  price: number;
  priceBucket: string; // chave do intervalo de preço ('' = sob consulta)
  nextDate: string | null; // AAAA-MM-DD da próxima turma
  position: number;
}

export interface Option {
  value: string;
  label: string;
}

const SORTS: Option[] = [
  { value: 'relevancia', label: 'Destaque' },
  { value: 'data', label: 'Próxima turma' },
  { value: 'preco-asc', label: 'Preço: mais baixo' },
  { value: 'preco-desc', label: 'Preço: mais alto' },
  { value: 'az', label: 'Nome (A–Z)' },
];

const DATES: Option[] = [
  { value: 'marcada', label: 'Com turma marcada' },
  { value: '30', label: 'Nos próximos 30 dias' },
  { value: '90', label: 'Nos próximos 3 meses' },
];

const STATUS: Option[] = [
  { value: 'open', label: 'Inscrições abertas' },
  { value: 'soon', label: 'Em breve' },
  { value: 'done', label: 'Edições realizadas' },
];

const MODES: Option[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
];

const KEYS = ['q', 'area', 'modalidade', 'nivel', 'data', 'preco', 'estado', 'ordem'] as const;
type Key = (typeof KEYS)[number];
type Filters = Record<Key, string>;

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const addDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

export function CourseExplorer({
  items,
  cards,
  areas,
  levels,
  prices,
}: {
  items: ExplorerItem[];
  cards: Record<string, ReactNode>;
  areas: Option[];
  levels: Option[];
  prices: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetId = useId();

  const filters = useMemo(() => {
    const f = {} as Filters;
    for (const k of KEYS) f[k] = params.get(k) ?? '';
    return f;
  }, [params]);
  const [query, setQuery] = useState(filters.q);

  const visible = useMemo(() => {
    const q = normalize(filters.q.trim());
    const today = addDays(0);
    const limit = filters.data === '30' ? addDays(30) : filters.data === '90' ? addDays(90) : null;
    const list = items.filter((c) => {
      if (q && !q.split(/\s+/).every((w) => c.text.includes(w))) return false;
      if (filters.area && c.area !== filters.area) return false;
      if (filters.modalidade && !c.modes.includes(filters.modalidade as 'presencial' | 'online')) return false;
      if (filters.nivel && c.level !== filters.nivel) return false;
      if (filters.estado && c.status !== filters.estado) return false;
      if (filters.preco && c.priceBucket !== filters.preco) return false;
      if (filters.data && (!c.nextDate || c.nextDate < today || (limit && c.nextDate > limit))) return false;
      return true;
    });
    const by = filters.ordem || 'relevancia';
    const priced = (c: ExplorerItem, dir: 1 | -1) => (c.price > 0 ? c.price * dir : Number.POSITIVE_INFINITY);
    return list.sort((a, b) => {
      if (by === 'data') return (a.nextDate ?? '9999').localeCompare(b.nextDate ?? '9999');
      if (by === 'preco-asc') return priced(a, 1) - priced(b, 1);
      if (by === 'preco-desc') return priced(a, -1) - priced(b, -1);
      if (by === 'az') return a.title.localeCompare(b.title, 'pt');
      return a.position - b.position;
    });
  }, [items, filters]);

  const visibleIds = visible.map((c) => c.id);
  const key = visibleIds.join(',');
  const active = KEYS.filter((k) => k !== 'ordem' && k !== 'q' && filters[k]);

  // Anima a grelha entre o estado anterior e o novo (Flip).
  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      if (!state || prefersReducedMotion()) {
        refreshReveals();
        return;
      }
      Flip.from(state, {
        targets: gridRef.current?.querySelectorAll('[data-flip]'),
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.03,
        absolute: true,
        scale: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.1 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { dependencies: [key], scope: gridRef }
  );

  function update(next: Partial<Filters>) {
    if (gridRef.current) flipState.current = Flip.getState(gridRef.current.querySelectorAll('[data-flip]'));
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Pesquisa com pequeno atraso para não animar a cada tecla.
  useEffect(() => {
    if (query === filters.q) return;
    const t = setTimeout(() => update({ q: query }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!sheetOpen) return;
    document.documentElement.classList.add('lenis-stopped');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('lenis-stopped');
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen]);

  const labelOf = (k: Key, v: string) =>
    ({ area: areas, modalidade: MODES, nivel: levels, data: DATES, preco: prices, estado: STATUS })[k as 'area']?.find((o) => o.value === v)?.label ?? v;

  const selects = (
    <>
      {areas.length > 1 && <FilterSelect label="Área" value={filters.area} options={areas} onChange={(v) => update({ area: v })} />}
      <FilterSelect label="Modalidade" value={filters.modalidade} options={MODES} onChange={(v) => update({ modalidade: v })} />
      {levels.length > 0 && <FilterSelect label="Nível" value={filters.nivel} options={levels} onChange={(v) => update({ nivel: v })} />}
      <FilterSelect label="Data" value={filters.data} options={DATES} onChange={(v) => update({ data: v })} />
      {prices.length > 1 && <FilterSelect label="Preço" value={filters.preco} options={prices} onChange={(v) => update({ preco: v })} />}
      <FilterSelect label="Estado" value={filters.estado} options={STATUS} onChange={(v) => update({ estado: v })} />
    </>
  );

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-[var(--gutter)] bg-background/85 px-[var(--gutter)] py-4 backdrop-blur-xl sm:top-24">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-0 flex-1 basis-64">
            <span className="sr-only">Pesquisar cursos</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-tertiary" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por tema, curso ou área"
              className="input-form rounded-full pl-12"
            />
          </label>
          <FilterSelect label="Ordenar" value={filters.ordem} options={SORTS} placeholder="Destaque" onChange={(v) => update({ ordem: v })} compact />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            aria-controls={sheetId}
            className="btn btn-outline-dark min-h-12 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtros{active.length ? ` (${active.length})` : ''}
          </button>
        </div>
        <div className="mt-3 hidden flex-wrap gap-3 lg:flex">{selects}</div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p aria-live="polite" className="mr-2 text-sm text-tertiary">
          {visible.length === 1 ? '1 curso' : `${visible.length} cursos`}
        </p>
        {active.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => update({ [k]: '' })}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-royal"
          >
            {labelOf(k, filters[k])}
            <X className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">(remover filtro)</span>
          </button>
        ))}
        {(active.length > 0 || filters.q) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              update(Object.fromEntries(KEYS.filter((k) => k !== 'ordem').map((k) => [k, ''])));
            }}
            className="min-h-9 text-sm font-semibold text-royal underline-offset-4 hover:underline"
          >
            Limpar tudo
          </button>
        )}
      </div>

      <ul ref={gridRef} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const order = visibleIds.indexOf(c.id);
          return (
            <li key={c.id} data-flip data-flip-id={c.id} style={{ order: order < 0 ? 999 : order }} className={order < 0 ? 'hidden' : undefined}>
              {cards[c.id]}
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-line p-12 text-center">
          <p className="text-lg font-semibold text-ink">Nenhum curso corresponde a estes filtros.</p>
          <p className="mt-2 text-tertiary">Experimente retirar um filtro, ou peça-nos uma formação à medida.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                update(Object.fromEntries(KEYS.map((k) => [k, ''])));
              }}
              className="btn btn-dark"
            >
              Ver todos os cursos
            </button>
            <Link href="/empresas#proposta" className="btn btn-outline-dark">
              Pedir formação à medida
            </Link>
          </div>
        </div>
      )}

      {/* Filtros em ecrã inteiro (mobile/tablet) */}
      {sheetOpen && (
        <div id={sheetId} role="dialog" aria-modal="true" aria-label="Filtros" className="fixed inset-0 z-[60] lg:hidden" data-lenis-prevent>
          <button type="button" aria-label="Fechar filtros" onClick={() => setSheetOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-[2rem] bg-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">Filtros</h2>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-line">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="mt-6 grid gap-4">{selects}</div>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn btn-dark mt-8 w-full">
              Ver {visible.length === 1 ? '1 curso' : `${visible.length} cursos`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Todas',
  compact = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div className={`relative ${compact ? '' : 'min-w-0 lg:flex-1'}`}>
      <label htmlFor={id} className={compact ? 'sr-only' : 'mb-1.5 block text-xs font-semibold tracking-wide text-tertiary uppercase lg:sr-only'}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-form min-h-12 cursor-pointer appearance-none rounded-full bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b6478' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat py-3 pr-10 ${
          value ? 'border-ink font-semibold' : ''
        }`}
      >
        <option value="">{compact ? placeholder : `${label}: ${placeholder.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
