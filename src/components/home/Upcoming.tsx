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
  { title: 'Receba a confirmação', text: 'A nossa equipa liga-lhe para confirmar a vaga e combinar o pagamento.' },
];

/** Próximas turmas e como funciona a inscrição. */
export function Upcoming({ sessions, title }: { sessions: SessionWithSeats[]; title: string }) {
  return (
    <section className="section-y relative overflow-clip bg-brand-50">
      <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
      <div className="container-x relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span data-reveal="fade" className="eyebrow bg-white">
              Calendário
            </span>
            <SplitReveal className="display-lg mt-6 text-balance text-ink">
              <Accent text={title} />
            </SplitReveal>
          </div>
          <Link data-reveal href="/calendario" className="btn btn-light self-start lg:self-auto">
            Ver calendário completo <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {sessions.length > 0 ? (
          <ul className="mt-12 grid gap-3">
            {sessions.map((s, i) => (
              <li key={s.id} data-reveal="up" data-reveal-delay={i * 0.06}>
                <SessionRow s={s} />
              </li>
            ))}
          </ul>
        ) : (
          <p data-reveal className="mt-12 rounded-[1.75rem] border-2 border-dashed border-brand-200 bg-white/60 p-10 text-center text-tertiary">
            Ainda não há turmas com data marcada.{' '}
            <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
              Deixe o seu contacto
            </Link>{' '}
            e avisamos quando abrirem inscrições.
          </p>
        )}

        <div className="mt-24">
          <span data-reveal="fade" className="eyebrow bg-white">
            Como funciona a inscrição
          </span>
          <StepsTimeline steps={ENROLL_STEPS} />
        </div>
      </div>
    </section>
  );
}
