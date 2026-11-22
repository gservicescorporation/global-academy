'use client';

import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { btn, inputCls } from './ui';

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/** Arrastar para reordenar (rato) — os botões ↑/↓ cobrem teclado e toque. */
function useDragSort<T>(items: T[], onChange: (v: T[]) => void) {
  const from = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const handlers = (i: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      from.current = i;
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (e: React.DragEvent) => {
      if (from.current === null) return;
      e.preventDefault();
      setOverIndex(i);
    },
    onDragEnd: () => {
      from.current = null;
      setOverIndex(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (from.current !== null) onChange(moveItem(items, from.current, i));
      from.current = null;
      setOverIndex(null);
    },
  });
  return { handlers, overIndex };
}

export function Repeater<T>({
  label,
  hint,
  items,
  onChange,
  create,
  render,
  itemTitle,
  addLabel = 'Adicionar',
  empty = 'Ainda não há itens.',
  error,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (v: T[]) => void;
  create: () => T;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  itemTitle: (item: T, index: number) => string;
  addLabel?: string;
  empty?: string;
  error?: string;
}) {
  const [open, setOpen] = useState<number | null>(items.length === 0 ? null : items.length <= 2 ? -1 : null);
  const { handlers, overIndex } = useDragSort(items, onChange);
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const isOpen = (i: number) => open === -1 || open === i;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-ink">
            {label} <span className="font-normal text-tertiary">({items.length})</span>
          </span>
          {hint && <p className="text-xs text-tertiary">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            onChange([...items, create()]);
            setOpen(items.length);
          }}
          className="flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-royal"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-tertiary">{empty}</p>}
      <ol className="grid gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            {...handlers(i)}
            className={`rounded-2xl border bg-white transition-colors ${overIndex === i ? 'border-royal' : 'border-line'}`}
          >
            <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
              <span className="hidden cursor-grab text-tertiary sm:block" aria-hidden>
                <GripVertical className="h-4 w-4" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(isOpen(i) ? null : i)}
                aria-expanded={isOpen(i)}
                className="flex min-h-10 min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-ink"
              >
                <span className="text-tertiary tabular-nums">{i + 1}.</span>
                <span className="truncate">{itemTitle(item, i) || 'Sem título'}</span>
                <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-tertiary transition-transform ${isOpen(i) ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              <span className="flex shrink-0 gap-0.5">
                <button type="button" aria-label={`Subir item ${i + 1}`} disabled={i === 0} onClick={() => onChange(moveItem(items, i, i - 1))} className={btn.icon}>
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" aria-label={`Descer item ${i + 1}`} disabled={i === items.length - 1} onClick={() => onChange(moveItem(items, i, i + 1))} className={btn.icon}>
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Remover item ${i + 1}`}
                  onClick={() => onChange(items.filter((_, k) => k !== i))}
                  className={`${btn.icon} text-red-600 hover:bg-red-50 hover:text-red-700`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </span>
            </div>
            {isOpen(i) && <div className="grid gap-4 border-t border-line p-4">{render(item, (p) => update(i, p), i)}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Lista simples de textos (uma linha cada), reordenável. */
export function StringList({
  label,
  hint,
  value,
  onChange,
  placeholder,
  addLabel = 'Adicionar linha',
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const { handlers, overIndex } = useDragSort(value, onChange);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const add = (at = value.length) => {
    const next = [...value];
    next.splice(at, 0, '');
    onChange(next);
    requestAnimationFrame(() => refs.current[at]?.focus());
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div>
        <span className="font-medium text-ink">
          {label} <span className="font-normal text-tertiary">({value.filter(Boolean).length})</span>
        </span>
        {hint && <p className="text-xs text-tertiary">{hint}</p>}
      </div>
      <ol className="grid gap-2">
        {value.map((v, i) => (
          <li key={i} {...handlers(i)} className={`flex items-center gap-1.5 rounded-xl ${overIndex === i ? 'ring-2 ring-royal' : ''}`}>
            <span className="hidden cursor-grab text-tertiary sm:block" aria-hidden>
              <GripVertical className="h-4 w-4" />
            </span>
            <input
              ref={(el) => void (refs.current[i] = el)}
              value={v}
              placeholder={placeholder}
              aria-label={`${label}, linha ${i + 1}`}
              onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add(i + 1);
                }
                if (e.key === 'Backspace' && !v && value.length > 0) {
                  e.preventDefault();
                  onChange(value.filter((_, k) => k !== i));
                  requestAnimationFrame(() => refs.current[Math.max(0, i - 1)]?.focus());
                }
              }}
              className={inputCls}
            />
            <button type="button" aria-label={`Subir linha ${i + 1}`} disabled={i === 0} onClick={() => onChange(moveItem(value, i, i - 1))} className={btn.icon}>
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" aria-label={`Remover linha ${i + 1}`} onClick={() => onChange(value.filter((_, k) => k !== i))} className={`${btn.icon} text-red-600 hover:bg-red-50`}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => add()} className="flex items-center gap-1 self-start rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-tertiary hover:border-royal hover:text-royal">
        <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
      </button>
      <p className="text-[11px] text-tertiary">Enter cria uma nova linha; arraste para reordenar.</p>
    </div>
  );
}
