'use client';

import { Copy, MoreVertical, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { deleteCourseAction, duplicateCourseAction, toggleCourseAction } from '@/app/admin/actions';
import { Switch, btn, useAction } from '@/components/admin/ui';

export function CourseToggle({ id, field, value }: { id: string; field: 'published' | 'featured'; value: boolean }) {
  const { pending, call } = useAction();
  return <Switch label={field === 'published' ? 'Publicado' : 'Destaque'} checked={value} disabled={pending} onChange={() => call(() => toggleCourseAction(id, field))} />;
}

export function CourseMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { pending, call } = useAction();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" aria-label="Mais ações" onClick={() => setOpen((o) => !o)} className={btn.icon}>
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-10 mt-1 grid w-48 gap-1 rounded-2xl border border-line bg-paper p-2 text-sm shadow-2xl">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              call(() => duplicateCourseAction(id), { success: 'Cópia criada como rascunho.' }).then((res) => {
                if (res.ok && res.data) router.push(`/admin/cursos/${res.data.id}`);
              });
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-ink hover:bg-background"
          >
            <Copy className="h-4 w-4" aria-hidden /> Duplicar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              if (window.confirm('Apagar este curso? Só é possível se não tiver inscrições.')) call(() => deleteCourseAction(id));
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Apagar
          </button>
        </div>
      )}
    </div>
  );
}
