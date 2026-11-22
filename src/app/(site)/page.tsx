import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';
import { Approach } from '@/components/home/Approach';
import { Areas } from '@/components/home/Areas';
import { FinalCta } from '@/components/home/FinalCta';
import { Manifesto } from '@/components/home/Manifesto';
import { Testimonials } from '@/components/home/Testimonials';
import { TickerBand } from '@/components/home/TickerBand';
import { Trainers } from '@/components/home/Trainers';
import { Upcoming } from '@/components/home/Upcoming';
import { Why } from '@/components/home/Why';
import HorizontalPin from '@/components/motion/HorizontalPin';
import SplitReveal from '@/components/motion/SplitReveal';
import { Accent } from '@/components/site/Accent';
import { HeroSlider, type HeroSlideData } from '@/components/site/HeroSlider';
import { PartnersMarquee } from '@/components/site/PartnersMarquee';
import {
  getAreas,
  getFeaturedCourses,
  getHeroSlides,
  getHighlights,
  getPartners,
  getSettings,
  getTestimonials,
  getTrainers,
  getUpcomingSessions,
  getWhyItems,
} from '@/lib/queries';
import { lines } from '@/lib/utils';

export const revalidate = 300;

const HERO_PHOTOS = [2, 4, 3, 1].map((n) => `/images/hero/formacao-${n}.jpg`);

export default async function Home() {
  const [s, slides, featured, upcoming, highlights, why, partners, areas, trainers, testimonials] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getFeaturedCourses(6),
    getUpcomingSessions({ limit: 4 }),
    getHighlights(),
    getWhyItems(),
    getPartners(),
    getAreas(),
    getTrainers(),
    getTestimonials(),
  ]);

  // Sem destaques no painel, o topo usa o título das definições (e a galeria/imagem de fundo, se houver).
  // Fotos de formação incluídas no projeto cobrem qualquer destaque sem imagem.
  const heroSlides: HeroSlideData[] = (slides.length
    ? slides
    : (() => {
        const images = lines(s.hero_images);
        const base = {
          title: [s.hero_title, s.hero_title_accent && `*${s.hero_title_accent}*`].filter(Boolean).join(' '),
          description: s.hero_subtitle,
          link: '/cursos',
          buttonText: s.hero_cta_primary,
        };
        const list = images.length ? images : s.hero_image ? [s.hero_image] : HERO_PHOTOS;
        return list.map((imageUrl, i) => ({ id: `fallback-${i}`, imageUrl, ...base }));
      })()
  ).map((slide, i) => ({ ...slide, imageUrl: slide.imageUrl || HERO_PHOTOS[i % HERO_PHOTOS.length] }));

  return (
    <main>
      <HeroSlider
        slides={heroSlides}
        eyebrow={s.hero_eyebrow}
        secondary={{ href: '/empresas', label: s.hero_cta_secondary || 'Formação para empresas' }}
        chips={highlights.slice(0, 2).map((h) => ({ value: h.value, label: h.label }))}
      />

      <TickerBand items={featured.map((c) => c.title)} />

      <Manifesto text={s.manifesto} stats={highlights} />

      {featured.length > 0 && (
        <HorizontalPin
          className="section-y bg-brand-50 text-ink lg:py-0"
          intro={
            <div>
              <span data-reveal="fade" className="eyebrow bg-white">
                Cursos em destaque
              </span>
              <SplitReveal className="display-lg mt-6 text-balance">
                <Accent text={s.featured_title} />
              </SplitReveal>
              {s.featured_subtitle && (
                <p data-reveal className="mt-6 max-w-md text-lg text-tertiary">
                  {s.featured_subtitle}
                </p>
              )}
              <Link data-reveal href="/cursos" className="btn btn-dark mt-10">
                Ver todos os cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          }
          outro={
            <Link
              href="/cursos"
              className="group hidden h-full min-h-[24rem] w-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-brand-200 text-center transition-colors hover:border-brand-500 hover:bg-white lg:flex"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-500 group-hover:scale-110">
                <ArrowUpRight className="h-8 w-8 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
              </span>
              <span className="font-head text-lg font-bold">Ver todos os cursos</span>
            </Link>
          }
        >
          {featured.map((c) => (
            <CourseCard key={c.id} course={c} sizes="(min-width: 1024px) 32vw, 100vw" />
          ))}
        </HorizontalPin>
      )}

      <Areas areas={areas} title={s.areas_title} text={s.areas_text} />

      <Approach
        title={s.diff_title}
        text={s.diff_text}
        bullets={lines(s.diff_bullets)}
        images={[s.diff_image, s.diff_image_2, s.diff_image_3].filter(Boolean)}
      />

      <Why items={why} title={s.why_title} text={s.why_subtitle} />

      <Trainers trainers={trainers} title={s.trainers_title} text={s.trainers_text} />

      <Upcoming sessions={upcoming} title={s.upcoming_title} />

      <Testimonials items={testimonials} title={s.testimonials_title} />

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
