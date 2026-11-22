import { ArrowUpRight, Check } from 'lucide-react';
import Image from 'next/image';
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
    <section className="bg-background py-6 sm:py-10">
      <div className="container-x grid gap-6 lg:grid-cols-2">
        <div data-reveal="up" className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[2rem] bg-paper p-8 ring-1 ring-line sm:p-12">
          <div>
            <span className="eyebrow text-royal">Para si</span>
            <SplitReveal as="h2" className="display-md mt-6 text-balance text-ink">
              <Accent text={title} className="serif-accent text-royal" />
            </SplitReveal>
            {text && <p className="mt-5 max-w-md text-lg text-tertiary">{text}</p>}
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-sm font-medium text-ink">Pagamento por Multicaixa Express, referência ou transferência.</p>
              <div className="mt-4 flex gap-3">
                <Image src="/images/payments/express.png" alt="Multicaixa Express" width={84} height={55} className="h-10 w-auto" />
                <Image src="/images/payments/referencia.png" alt="Pagamento por referência Multicaixa" width={85} height={55} className="h-10 w-auto" />
              </div>
            </div>
          </div>
          <Link href="/cursos" className="btn btn-dark mt-10 self-start">
            {cta} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div data-reveal="up" data-reveal-delay={0.08} className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[2rem] bg-royal p-8 text-white sm:p-12">
          <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
          <div aria-hidden className="pointer-events-none absolute -right-1/4 -bottom-1/2 h-full w-full rounded-full bg-accent/30 blur-[100px]" />
          <div className="relative">
            <span className="eyebrow text-white/70">Para empresas</span>
            <SplitReveal as="h2" className="display-md mt-6 text-balance">
              <Accent text={companiesTitle} className="serif-accent text-white/70" />
            </SplitReveal>
            {companiesText && <p className="mt-5 max-w-md text-lg text-white/75">{companiesText}</p>}
            {companiesPoints.length > 0 && (
              <ul className="mt-8 grid gap-3">
                {companiesPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href="/empresas" className="btn btn-dark relative mt-10 self-start">
            Pedir proposta <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
