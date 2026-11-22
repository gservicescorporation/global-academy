import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import SplitReveal from '../motion/SplitReveal';
import { SessionRow } from '../SessionRow';
import { Accent } from '../site/Accent';
import { StepsTimeline } from '../site/StepsTimeline';
import type { SessionWithSeats } from '@/lib/queries';

export const ENROLL_STEPS = [
  { title: 'Escolha a turma', text: 'Veja datas, local e vagas disponíveis de cada curso.' },
  { title: 'Preencha os dados', text: 'Do formando ou da empresa, e quantas pessoas vão participar.' },
  { title: 'Pague', text: 'Multicaixa Express, referência ou transferência bancária.' },
  { title: 'Receba a confirmação', text: 'A inscrição fica confirmada quando o pagamento é recebido.' },
];

/** Secção escura: próximas turmas e como funciona a inscrição. */
export function Upcoming({ sessions, title }: { sessions: SessionWithSeats[]; title: string }) {
  return (
    <section className="section-y relative overflow-clip bg-ink text-white">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[720px] rounded-full bg-royal/25 blur-[140px]" />
      <div className="container-x relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span data-reveal="fade" className="eyebrow text-accent">
              Calendário
            </span>
            <SplitReveal className="display-lg mt-6 text-balance">
              <Accent text={title} className="serif-accent text-white/60" />
            </SplitReveal>
          </div>
          <Link data-reveal href="/calendario" className="btn btn-outline-light self-start lg:self-auto">
            Ver calendário completo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {sessions.length > 0 ? (
          <ul className="mt-14 grid gap-4">
            {sessions.map((s, i) => (
              <li key={s.id} data-reveal="up" data-reveal-delay={i * 0.05}>
                <SessionRow s={s} tone="dark" />
              </li>
            ))}
          </ul>
        ) : (
          <p data-reveal className="mt-14 rounded-[1.75rem] border border-dashed border-white/20 p-10 text-center text-white/70">
            Ainda não há turmas com data marcada.{' '}
            <Link href="/contacto" className="font-semibold text-accent underline-offset-4 hover:underline">
              Deixe o seu contacto
            </Link>{' '}
            e avisamos quando abrirem inscrições.
          </p>
        )}

        <div className="mt-24 border-t border-white/10 pt-16">
          <span data-reveal="fade" className="eyebrow text-accent">
            Como funciona a inscrição
          </span>
          <StepsTimeline steps={ENROLL_STEPS} />
        </div>
      </div>
    </section>
  );
}
