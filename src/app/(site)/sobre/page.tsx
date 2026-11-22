import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { Approach } from '@/components/home/Approach';
import { FinalCta } from '@/components/home/FinalCta';
import { Manifesto } from '@/components/home/Manifesto';
import { Trainers } from '@/components/home/Trainers';
import { Why } from '@/components/home/Why';
import SplitReveal from '@/components/motion/SplitReveal';
import { Accent, plain } from '@/components/site/Accent';
import { PageHero } from '@/components/site/PageHero';
import { PartnersMarquee } from '@/components/site/PartnersMarquee';
import { getHighlights, getPartners, getSettings, getTrainers, getWhyItems } from '@/lib/queries';
import { lines } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: 'Sobre a academia', description: plain(s.about_subtitle).slice(0, 160), alternates: { canonical: '/sobre' } };
}

export default async function AboutPage() {
  const [s, highlights, why, partners, trainers] = await Promise.all([getSettings(), getHighlights(), getWhyItems(), getPartners(), getTrainers()]);

  return (
    <main>
      <PageHero eyebrow="Sobre a academia" title={<Accent text={s.about_title} className="serif-accent text-white/60" />} text={s.about_subtitle} />

      <Manifesto text={s.manifesto} stats={highlights} />

      <Approach title={s.diff_title} text={s.diff_text} bullets={lines(s.diff_bullets)} images={[s.diff_image, s.diff_image_2, s.diff_image_3].filter(Boolean)} />

      <Why items={why} title={s.why_title} text={s.why_subtitle} />

      <Trainers trainers={trainers} title={s.trainers_title} text={s.trainers_text} />

      {s.parent_company && (
        <section className="section-y relative overflow-clip bg-ink text-white">
          <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
          <div className="container-x relative grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span data-reveal="fade" className="eyebrow text-accent">
                Grupo
              </span>
              <SplitReveal className="display-lg mt-6 text-balance">
                Parte da <span className="serif-accent text-white/60">{s.parent_company}.</span>
              </SplitReveal>
              <p data-reveal className="mt-6 max-w-2xl text-lg text-white/65">
                A academia é a área de formação da {s.parent_company}, que trabalha também em mediação de seguros, eventos e comunicação em Angola.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <a data-reveal href="https://www.globalsc.ao" target="_blank" rel="noopener noreferrer" className="btn btn-light">
                Visitar globalsc.ao <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>
      )}

      <PartnersMarquee items={partners} title={s.partners_title} />

      <FinalCta
        title={s.final_title}
        text={s.final_text}
        cta={s.final_cta}
        companiesTitle={s.companies_title}
        companiesText={s.companies_text}
        companiesPoints={lines(s.companies_points)}
      />
    </main>
  );
}
