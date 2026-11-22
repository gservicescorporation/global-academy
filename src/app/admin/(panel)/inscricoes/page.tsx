import { Download } from 'lucide-react';
import { Badge, Empty, PageTitle } from '@/components/admin/ui';
import { EnrollmentFilters } from './EnrollmentFilters';
import { EnrollmentStatusSelect } from './EnrollmentStatusSelect';
import { ENROLLMENT_STATUS, listEnrollments } from '@/server/enrollments';
import { getCourses } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

export default async function EnrollmentsAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [{ filters, rows }, courses] = await Promise.all([listEnrollments(sp), getCourses()]);
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();

  return (
    <>
      <PageTitle
        title="Inscrições"
        text={`${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'}.`}
        action={
          <a href={`/api/admin/inscricoes/export${qs ? `?${qs}` : ''}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-paper px-5 text-sm font-semibold text-ink hover:border-ink">
            <Download className="h-4 w-4" aria-hidden /> Exportar CSV
          </a>
        }
      />

      <EnrollmentFilters filters={filters} courses={courses.map((c) => ({ value: c.id, label: c.title }))} />

      {rows.length === 0 ? (
        <Empty>Nenhuma inscrição encontrada.</Empty>
      ) : (
        <div className="mt-6 grid gap-4">
          {rows.map((e) => (
            <article key={e.id} className="grid gap-4 rounded-3xl border border-line bg-paper p-6 lg:grid-cols-[1.4fr_1fr_auto] lg:items-center">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-ink">
                  {e.fullName}
                  {e.company && <span className="font-normal text-tertiary"> · {e.company}</span>}
                  <Badge tone={ENROLLMENT_STATUS[e.status].tone}>{ENROLLMENT_STATUS[e.status].label}</Badge>
                </p>
                <p className="text-[15px] text-tertiary">
                  <a href={`mailto:${e.email}`} className="hover:text-royal">
                    {e.email}
                  </a>{' '}
                  · {e.phone}
                </p>
                <p className="mt-1 text-sm text-tertiary">
                  {e.reference} · {new Date(e.createdAt).toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' })}
                </p>
              </div>
              <div className="text-[15px]">
                <p className="font-semibold text-ink">{e.courseTitle}</p>
                <p className="text-tertiary">{e.sessionLabel}</p>
                <p className="text-tertiary">
                  {e.participants}x · {formatPrice(e.amount, e.currency)} · {e.paymentMethodName}
                </p>
              </div>
              <EnrollmentStatusSelect id={e.id} status={e.status} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
