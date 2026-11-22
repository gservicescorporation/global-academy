import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SplitReveal from '@/components/motion/SplitReveal';
import { SessionRow } from '@/components/SessionRow';
import { PageHero } from '@/components/site/PageHero';
import { getUpcomingSessions, type SessionWithSeats } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Calendário',
  description: 'Próximas turmas dos cursos da academia, com datas, local, vagas disponíveis e preço.',
  alternates: { canonical: '/calendario' },
};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default async function CalendarPage() {
  const sessions = await getUpcomingSessions();

  // Agrupa por mês de início.
  const groups = new Map<string, SessionWithSeats[]>();
  for (const s of sessions) {
    const key = s.startDate.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }

  return (
    <main>
      <PageHero
        eyebrow="Calendário"
        title={
          <>
            Próximas <span className="serif-accent text-white/60">turmas.</span>
          </>
        }
        text="Datas, local e vagas disponíveis. As turmas são pequenas: quando uma esgota, abrimos nova data."
      />

      <section className="section-y bg-background">
        <div className="container-x">
          {sessions.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-line p-12 text-center">
              <p className="text-lg font-semibold text-ink">Ainda não há turmas com data marcada.</p>
              <p className="mt-2 text-tertiary">Veja os cursos disponíveis ou deixe o seu contacto para ser avisado.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/cursos" className="btn btn-dark">
                  Ver cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/contacto?assunto=Aviso%20de%20novas%20turmas" className="btn btn-outline-dark">
                  Ser avisado
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-16">
              {[...groups].map(([key, list]) => {
                const [y, m] = key.split('-').map(Number);
                return (
                  <div key={key} className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                      <div className="lg:sticky lg:top-32">
                        <SplitReveal as="h2" className="display-md text-ink">
                          {MONTHS[m - 1]} <span className="serif-accent text-royal">{y}</span>
                        </SplitReveal>
                        <p className="mt-2 text-sm text-tertiary">
                          {list.length} {list.length === 1 ? 'turma' : 'turmas'}
                        </p>
                      </div>
                    </div>
                    <ul className="grid content-start gap-4 lg:col-span-9">
                      {list.map((s, i) => (
                        <li key={s.id} data-reveal="up" data-reveal-delay={i * 0.04}>
                          <SessionRow s={s} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
