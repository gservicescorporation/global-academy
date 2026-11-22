'use client';

import { GripVertical } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { reorderResourceAction } from '@/app/admin/actions';
import { useAction } from '@/components/admin/ui';

export interface Row {
  id: string;
  cells: ReactNode;
}

/** Linhas pré-renderizadas no servidor; só a ordem (arrastar) é tratada no cliente. */
export function ReorderableRows({ resourceKey, rows, reorderable, head }: { resourceKey: string; rows: Row[]; reorderable: boolean; head: ReactNode }) {
  const [list, setList] = useState(rows);
  const from = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { call } = useAction();

  const drop = (to: number) => {
    if (from.current === null || from.current === to) return;
    const next = [...list];
    const [it] = next.splice(from.current, 1);
    next.splice(to, 0, it);
    setList(next);
    call(() => reorderResourceAction(resourceKey, next.map((r) => r.id)), { success: 'Ordem guardada.', refresh: false });
  };

  return (
    <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-paper">
      <table className="w-full min-w-160 text-left">
        <thead className="border-b border-line text-sm text-tertiary">
          <tr>
            {reorderable && <th className="w-8" />}
            {head}
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((row, i) => (
            <tr
              key={row.id}
              draggable={reorderable}
              onDragStart={() => void (from.current = i)}
              onDragOver={(e) => {
                if (from.current === null) return;
                e.preventDefault();
                setOverIndex(i);
              }}
              onDragEnd={() => {
                from.current = null;
                setOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                drop(i);
              }}
              className={`border-b border-line pl-2 last:border-0 hover:bg-background/60 ${overIndex === i ? 'bg-royal/5' : ''}`}
            >
              {reorderable && (
                <td className="w-8 py-3.5 pl-4 text-tertiary" aria-hidden>
                  <GripVertical className="h-4 w-4 cursor-grab" />
                </td>
              )}
              {row.cells}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
