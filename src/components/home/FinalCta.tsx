import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';
import SplitReveal from '../motion/SplitReveal';
import { Accent } from '../site/Accent';

/** Duas saídas: inscrição individual e formação para empresas. */
export function FinalCta({
  title,
  text,
  cta,
  companiesTitle,
  companiesText,
  companiesPoints,
}: {
  title: string;
  text?: string;
  cta: string;
  companiesTitle: string;
  companiesText?: string;
  companiesPoints: string[];
}) {
  return (
    <section className="bg-background pt-6 pb-24 sm:pt-10 sm:pb-32">
      <div className="container-x grid gap-5 lg:grid-cols-2">
        <div data-reveal="up" className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-white p-8 ring-1 ring-line sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-brand-100" />
          <div className="relative">
            <span className="eyebrow">Para si</span>
            <SplitReveal as="h2" className="display-md mt-6 text-balance text-ink">
              <Accent text={title} />
            </SplitReveal>
            {text && <p className="mt-5 max-w-md text-lg text-tertiary">{text}</p>}
            <p className="mt-8 flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-tertiary">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
              Inscreve-se online sem pagar nada. A nossa equipa liga-lhe depois para confirmar a vaga e combinar o pagamento.
            </p>
          </div>
          <Link href="/cursos" className="btn btn-dark relative mt-10 self-start">
            {cta} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div
          data-reveal="up"
          data-reveal-delay={0.08}
          className="on-blue relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-12"
        >
          <div aria-hidden className="dots-white pointer-events-none absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-300/40 blur-3xl" />
          <div className="relative">
            <span className="eyebrow eyebrow-on-blue">Para empresas</span>
            <SplitReveal as="h2" className="display-md mt-6 text-balance">
              <Accent text={companiesTitle} />
            </SplitReveal>
            {companiesText && <p className="mt-5 max-w-md text-lg text-white">{companiesText}</p>}
            {companiesPoints.length > 0 && (
              <ul className="mt-8 grid gap-3">
                {companiesPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href="/empresas" className="btn btn-light relative mt-10 self-start">
            Pedir proposta <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
