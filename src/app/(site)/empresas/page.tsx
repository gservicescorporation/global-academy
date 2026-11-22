import type { Metadata } from 'next';
import { ProposalForm } from '@/components/forms/ProposalForm';
import SplitReveal from '@/components/motion/SplitReveal';
import { Accent, plain } from '@/components/site/Accent';
import { PageHero } from '@/components/site/PageHero';
import { PartnersMarquee } from '@/components/site/PartnersMarquee';
import { StepsTimeline } from '@/components/site/StepsTimeline';
import { getAreas, getPartners, getSettings } from '@/lib/queries';
import { lines } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'Formação para empresas',
    description: plain(s.companies_text).slice(0, 160),
    alternates: { canonical: '/empresas' },
  };
}

const STEPS = [
  { title: 'Diga-nos o que precisa', text: 'Tema, número de pessoas, formato e prazo, pelo formulário abaixo.' },
  { title: 'Recebe uma proposta', text: 'Programa, duração, formato e orçamento, por escrito.' },
  { title: 'Acertamos data e local', text: 'Nas vossas instalações, num espaço da academia ou online.' },
  { title: 'Formação e certificados', text: 'Cada participante recebe o certificado no fim.' },
];

export default async function CompaniesPage() {
  const [s, areas, partners] = await Promise.all([getSettings(), getAreas(), getPartners()]);
  const points = lines(s.companies_points);

  return (
    <main>
      <PageHero eyebrow="Formação para empresas" title={<Accent text={s.companies_title} className="serif-accent text-white/60" />} text={s.companies_text} />

      {points.length > 0 && (
        <section className="section-y bg-background">
          <div className="container-x">
            <ul className={`grid gap-4 ${points.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {points.map((p, i) => (
                <li key={p} data-reveal="up" data-reveal-delay={i * 0.06} className="flex min-h-48 flex-col justify-between gap-8 rounded-[1.75rem] bg-paper p-8 ring-1 ring-line">
                  <span className="text-sm font-semibold text-royal tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-2xl leading-snug font-semibold tracking-tight text-ink">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y relative overflow-clip bg-ink text-white">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <span data-reveal="fade" className="eyebrow text-accent">
            Como funciona
          </span>
          <SplitReveal className="display-lg mt-6 max-w-3xl text-balance">
            Do pedido à formação, <span className="serif-accent text-white/60">em quatro passos.</span>
          </SplitReveal>
          <StepsTimeline steps={STEPS} />
        </div>
      </section>

      <section id="proposta" className="section-y scroll-mt-24 bg-paper">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <span data-reveal="fade" className="eyebrow text-royal">
                Pedido de proposta
              </span>
              <SplitReveal className="display-lg mt-6 text-balance text-ink">
                Conte-nos o que a equipa <span className="serif-accent text-royal">precisa.</span>
              </SplitReveal>
              <p data-reveal className="mt-6 max-w-md text-lg text-tertiary">
                Respondemos por email com uma proposta concreta. Se preferir falar primeiro:
              </p>
              <ul data-reveal className="mt-6 grid gap-2 text-ink">
                {s.contact_phone && (
                  <li>
                    <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
                      {s.contact_phone}
                    </a>
                  </li>
                )}
                {s.contact_email && (
                  <li>
                    <a href={`mailto:${s.contact_email}`} className="inline-flex min-h-11 items-center font-semibold break-all underline-offset-4 hover:underline">
                      {s.contact_email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div data-reveal="up" className="rounded-[2rem] bg-background p-6 ring-1 ring-line sm:p-10 lg:col-span-7">
            <ProposalForm topics={areas.map((a) => a.name)} />
          </div>
        </div>
      </section>

      <PartnersMarquee items={partners} title={s.partners_title} tone="dark" />
    </main>
  );
}
