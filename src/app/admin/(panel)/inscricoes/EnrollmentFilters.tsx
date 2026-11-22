'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { inputCls } from '@/components/admin/ui';
import type { EnrollmentFilters as Filters } from '@/server/enrollments';

const STATUS = [
  { value: '', label: 'Todos os estados' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function EnrollmentFilters({ filters, courses }: { filters: Filters; courses: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = (patch: Partial<Filters>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={filters.q}
        onChange={(e) => update({ q: e.target.value })}
        placeholder="Pesquisar por nome, email, referência…"
        className={`${inputCls} max-w-xs`}
      />
      <select value={filters.status} onChange={(e) => update({ status: e.target.value as Filters['status'] })} className={`${inputCls} max-w-[12rem]`}>
        {STATUS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select value={filters.course} onChange={(e) => update({ course: e.target.value })} className={`${inputCls} max-w-[16rem]`}>
        <option value="">Todos os cursos</option>
        {courses.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <input type="date" value={filters.from} onChange={(e) => update({ from: e.target.value })} className={`${inputCls} max-w-[10rem]`} aria-label="De" />
      <input type="date" value={filters.to} onChange={(e) => update({ to: e.target.value })} className={`${inputCls} max-w-[10rem]`} aria-label="Até" />
    </div>
  );
}
