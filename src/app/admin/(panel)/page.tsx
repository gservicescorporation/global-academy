import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge, Empty, PageTitle } from '@/components/admin/ui';
import { ENROLLMENT_STATUS, dashboardStats } from '@/server/enrollments';
import { formatPrice } from '@/lib/utils';

export default async function Dashboard() {
  const { totals: t, upcoming, drafts, unread, weekly, recent } = await dashboardStats();
  const maxWeekly = Math.max(1, ...weekly.map((w) => w.n));

  const stats = [
    { l: 'Inscrições pendentes', v: t.pending, href: '/admin/inscricoes?status=pending' },
    { l: 'Inscrições pagas', v: t.paid, href: '/admin/inscricoes?status=paid' },
    { l: 'Mensagens por ler', v: unread, href: '/admin/mensagens' },
    { l: 'Cursos em rascunho', v: drafts.length, href: '/admin/cursos' },
  ];

  return (
    <>
      <PageTitle title="Visão geral" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="rounded-3xl border border-line bg-paper p-6 transition hover:border-ink/20">
            <p className="text-4xl font-bold tracking-tight text-ink">{s.v}</p>
            <p className="text-sm text-tertiary">{s.l}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-line bg-paper p-6">
          <p className="text-sm text-tertiary">Receita recebida (AOA)</p>
          <p className="mt-1 text-2xl font-bold text-ink">{formatPrice(t.revenue, 'AOA')}</p>
        </div>
        <div className="rounded-3xl border border-line bg-paper p-6">
          <p className="text-sm text-tertiary">Receita este mês (AOA)</p>
          <p className="mt-1 text-2xl font-bold text-ink">{formatPrice(t.revenue_month, 'AOA')}</p>
        </div>
        <div className="rounded-3xl border border-line bg-paper p-6">
          <p className="text-sm text-tertiary">Por receber, pendente (AOA)</p>
          <p className="mt-1 text-2xl font-bold text-ink">{formatPrice(t.receivable, 'AOA')}</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="min-w-0">
          <h2 className="mb-4 text-xl font-bold text-ink">Inscrições por semana</h2>
          <div className="overflow-x-auto rounded-3xl border border-line bg-paper p-6">
            <div className="flex h-40 min-w-max items-end gap-2 sm:min-w-0">
              {weekly.map((w) => (
                <div key={w.week} className="flex w-10 flex-col items-center gap-2 sm:w-auto sm:flex-1">
                  <div className="w-full rounded-t-md bg-royal/70" style={{ height: `${Math.max(4, (w.n / maxWeekly) * 100)}%` }} title={`${w.n} inscrições`} />
                  <span className="text-[10px] text-tertiary">{w.week.slice(5).replace('-', '/')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <h2 className="mb-4 text-xl font-bold text-ink">Próximas turmas</h2>
          {upcoming.length === 0 ? (
            <Empty>Sem turmas marcadas.</Empty>
          ) : (
            <ul className="grid min-w-0 gap-2">
              {upcoming.map((u) => (
                <li key={u.id} className="min-w-0">
                  <Link href={`/admin/cursos/${u.course_id}`} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4 text-sm hover:border-ink/20">
                    <span className="min-w-0 truncate font-medium text-ink">{u.title}</span>
                    <span className="shrink-0 text-tertiary">
                      {new Date(u.start).toLocaleDateString('pt-PT')} · {u.taken}/{u.seats}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-bold text-ink">Últimas inscrições</h2>
      {recent.length === 0 ? (
        <Empty>Ainda sem inscrições.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[600px] text-left text-[15px]">
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 font-semibold">{e.fullName}</td>
                  <td className="px-5 py-4 text-tertiary">{e.courseTitle}</td>
                  <td className="px-5 py-4">{formatPrice(e.amount, e.currency)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={ENROLLMENT_STATUS[e.status].tone}>{ENROLLMENT_STATUS[e.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/admin/inscricoes" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
        Ver todas as inscrições <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}
