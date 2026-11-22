import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge, Empty, PageTitle } from '@/components/admin/ui';
import { COURSE_STATUS, formatPrice } from '@/lib/utils';
import { listCoursesAdmin } from '@/server/courses';
import { CourseMenu, CourseToggle } from './CourseRowActions';

const STATUS_TONE: Record<string, string> = { soon: 'bg-gold-soft text-ink', open: 'bg-green-100 text-green-800', done: 'bg-background text-tertiary' };

export default async function CoursesAdmin() {
  const rows = await listCoursesAdmin();
  return (
    <>
      <PageTitle
        title="Cursos"
        text={`${rows.length} ${rows.length === 1 ? 'curso' : 'cursos'}.`}
        action={
          <Link href="/admin/cursos/novo" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-royal">
            <Plus className="h-4 w-4" aria-hidden /> Novo curso
          </Link>
        }
      />

      {rows.length === 0 ? (
        <Empty>Ainda não há cursos. Crie o primeiro.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-line text-sm text-tertiary">
              <tr>
                <th className="px-5 py-4 font-semibold">Curso</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Próxima turma</th>
                <th className="px-5 py-4 font-semibold">Preço</th>
                <th className="px-5 py-4 font-semibold">Inscrições</th>
                <th className="px-5 py-4 font-semibold">Publicado</th>
                <th className="px-5 py-4 font-semibold">Destaque</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-background/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/cursos/${c.id}`} className="flex items-center gap-3 font-semibold text-ink hover:text-royal">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.imageUrl} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="h-10 w-14 shrink-0 rounded-lg bg-background" aria-hidden />
                      )}
                      <span className="max-w-xs truncate">{c.title}</span>
                    </Link>
                    {c.area && <span className="mt-1 block pl-[4.25rem] text-xs text-tertiary">{c.area}</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={STATUS_TONE[c.status]}>{COURSE_STATUS[c.status].label}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-tertiary">{c.nextSession ? new Date(c.nextSession).toLocaleDateString('pt-PT') : '—'}</td>
                  <td className="px-5 py-3.5 text-sm">{formatPrice(c.price, c.currency)}</td>
                  <td className="px-5 py-3.5 text-sm text-tertiary">{c.enrollments}</td>
                  <td className="px-5 py-3.5">
                    <CourseToggle id={c.id} field="published" value={c.published} />
                  </td>
                  <td className="px-5 py-3.5">
                    <CourseToggle id={c.id} field="featured" value={c.featured} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <CourseMenu id={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
