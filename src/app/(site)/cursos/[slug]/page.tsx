import { ArrowLeft, ArrowUpRight, Award, CalendarDays, Clock, Globe2, Languages, MapPin, Signal } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourseCard, CourseCover } from '@/components/CourseCard';
import { CourseGallery } from '@/components/CourseGallery';
import { CourseNav } from '@/components/courses/CourseNav';
import { EnrollForm } from '@/components/forms/EnrollForm';
import { TrainerCard } from '@/components/home/Trainers';
import { ENROLL_STEPS } from '@/components/home/Upcoming';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { Img } from '@/components/site/Img';
import { JsonLd } from '@/components/site/JsonLd';
import { getCourseBySlug, getCourses, getPaymentMethods, getSettings, getTrainersByIds, getUpcomingSessions } from '@/lib/queries';
import { absoluteUrl, COURSE_STATUS, formatPrice, formatRange, lines, parseFaq } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCourseBySlug(slug);
  if (!c) return { title: 'Curso não encontrado' };
  const description = c.shortDescription.slice(0, 160);
  const images = c.imageUrl ? [{ url: absoluteUrl(c.imageUrl), width: 1200, height: 630, alt: c.title }] : undefined;
  return {
    title: c.title,
    description,
    alternates: { canonical: `/cursos/${c.slug}` },
    openGraph: { type: 'website', title: c.title, description, url: absoluteUrl(`/cursos/${c.slug}`), images },
    twitter: { card: 'summary_large_image', title: c.title, description, images: images?.map((i) => i.url) },
  };
}

const courseMode = (modality?: string | null) => {
  const m = (modality ?? '').toLowerCase();
  if (m.includes('online') && m.includes('presencial')) return 'Blended';
  if (m.includes('online')) return 'Online';
  return 'Onsite';
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [sessions, methods, s, trainers, all] = await Promise.all([
    getUpcomingSessions({ courseId: course.id }),
    getPaymentMethods(),
    getSettings(),
    getTrainersByIds(course.trainerIds),
    getCourses(),
  ]);

  const open = course.status !== 'done';
  const available = open ? sessions.filter((x) => x.remaining > 0) : [];
  const st = COURSE_STATUS[course.status];
  const objectives = lines(course.objectives);
  const audience = lines(course.audience);
  const program = lines(course.program);
  const gallery = lines(course.gallery);
  const faq = parseFaq(course.faq);
  const description = lines(course.description);
  const related = all.filter((c) => c.id !== course.id && course.area && c.area === course.area).slice(0, 3);
  const relatedList = related.length ? related : all.filter((c) => c.id !== course.id).slice(0, 3);

  const facts = [
    { icon: CalendarDays, label: 'Data', value: available[0] ? `${formatRange(available[0].startDate, available[0].endDate).full} ${available[0].startDate.slice(0, 4)}` : course.dateLabel },
    { icon: Clock, label: 'Duração', value: course.duration },
    { icon: Globe2, label: 'Modalidade', value: course.modality },
    { icon: MapPin, label: 'Local', value: course.venue },
    { icon: Signal, label: 'Nível', value: course.level },
    { icon: Languages, label: 'Idioma', value: course.language },
    { icon: Award, label: 'Certificado', value: course.certificate },
  ].filter((f) => f.value) as { icon: typeof Clock; label: string; value: string }[];

  // Módulos: linhas "#" abrem um módulo; as restantes são tópicos desse módulo.
  const modules: { title: string; topics: string[] }[] = [];
  for (const l of program) {
    if (l.startsWith('#')) modules.push({ title: l.replace(/^#+\s*/, ''), topics: [] });
    else if (modules.length && program.some((p) => p.startsWith('#'))) modules[modules.length - 1].topics.push(l);
    else modules.push({ title: l, topics: [] });
  }

  const nav = [
    { id: 'resumo', label: 'Resumo' },
    modules.length > 0 && { id: 'programa', label: 'Programa' },
    trainers.length > 0 && { id: 'formadores', label: trainers.length > 1 ? 'Formadores' : 'Formador' },
    { id: 'inscricao', label: open ? 'Turmas e inscrição' : 'Próximas edições' },
    faq.length > 0 && { id: 'faq', label: 'Perguntas frequentes' },
    gallery.length > 0 && { id: 'galeria', label: 'Galeria' },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <main>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.shortDescription,
          url: absoluteUrl(`/cursos/${course.slug}`),
          image: course.imageUrl ? absoluteUrl(course.imageUrl) : undefined,
          inLanguage: 'pt',
          provider: { '@type': 'EducationalOrganization', name: s.site_name, url: absoluteUrl('/') },
          educationalCredentialAwarded: course.certificate ? `Certificado ${course.certificate}` : undefined,
          teaches: objectives.length ? objectives : undefined,
          offers: Number(course.price)
            ? {
                '@type': 'Offer',
                category: 'Paid',
                price: Number(course.price),
                priceCurrency: course.currency || 'AOA',
                availability: available.length ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                url: absoluteUrl(`/cursos/${course.slug}#inscricao`),
              }
            : undefined,
          hasCourseInstance: sessions.map((x) => ({
            '@type': 'CourseInstance',
            courseMode: courseMode(course.modality),
            startDate: x.startDate,
            endDate: x.endDate,
            location: courseMode(course.modality) === 'Online' ? undefined : { '@type': 'Place', name: x.location ?? course.venue ?? 'Luanda', address: { '@type': 'PostalAddress', addressCountry: 'AO', addressLocality: 'Luanda' } },
            instructor: trainers.map((t) => ({ '@type': 'Person', name: t.name, description: t.role })),
          })),
        }}
      />

      {/* Topo */}
      <section className="relative overflow-hidden bg-ink pt-32 pb-16 text-white sm:pt-40 sm:pb-24">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -top-1/3 right-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-royal/30 blur-[130px]" />
        <div className="container-x relative grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Link href="/cursos" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Todos os cursos
            </Link>
            <div data-reveal="fade" className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
              {course.area && <span className="eyebrow text-accent">{course.area}</span>}
            </div>
            <SplitReveal as="h1" immediate delay={0.15} className="display-xl mt-6 text-balance" start="top 100%">
              {course.title}
            </SplitReveal>
            <p data-reveal className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              {course.shortDescription}
            </p>
            <div data-reveal className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href="#inscricao" className="btn btn-light">
                {available.length ? 'Inscrever-me' : 'Quero ser avisado'} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <div>
                <span className="block text-xs text-white/60">Por participante</span>
                <span className="text-2xl font-bold tracking-tight">{formatPrice(course.price, course.currency)}</span>
              </div>
            </div>
          </div>
          <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-night lg:col-span-5">
            {course.imageUrl ? (
              <Parallax className="absolute inset-0" speed={8} scale={1.12}>
                <div className="absolute inset-0">
                  <Img src={course.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              </Parallax>
            ) : (
              <CourseCover title={course.title} area={course.area} />
            )}
          </div>
        </div>

        {facts.length > 0 && (
          <div className="container-x relative mt-16">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-white/10 ring-1 ring-white/10 sm:grid-cols-3 lg:grid-cols-7">
              {facts.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} data-reveal="up" data-reveal-delay={i * 0.04} className="flex flex-col gap-2 bg-ink p-5">
                    <dt className="flex items-center gap-2 text-xs text-white/60">
                      <Icon className="h-4 w-4 text-accent" aria-hidden /> {f.label}
                    </dt>
                    <dd className="text-sm font-semibold">{f.value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </section>

      <CourseNav items={nav} cta={available.length ? { href: '#inscricao', label: 'Inscrever-me' } : null} />

      {/* Resumo */}
      <section id="resumo" className="section-y scroll-mt-20 bg-background">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span data-reveal="fade" className="eyebrow text-royal">
              Resumo
            </span>
            {course.focus && (
              <SplitReveal className="display-md mt-6 text-balance text-ink" by="lines">
                {course.focus}
              </SplitReveal>
            )}
            {description.length > 0 && (
              <div className="mt-8 grid gap-5 text-lg leading-relaxed text-tertiary">
                {description.map((p, i) => (
                  <p key={i} data-reveal>
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="grid content-start gap-6 lg:col-span-5">
            {objectives.length > 0 && (
              <div data-reveal="up" className="rounded-[1.75rem] bg-paper p-7 ring-1 ring-line sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-ink">O que vai aprender</h2>
                <ul className="mt-5 grid gap-4">
                  {objectives.map((o) => (
                    <li key={o} className="flex gap-3 text-ink">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {audience.length > 0 && (
              <div data-reveal="up" className="rounded-[1.75rem] bg-ink p-7 text-white sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight">A quem se destina</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {audience.map((a) => (
                    <li key={a} className="rounded-full bg-white/10 px-4 py-2 text-sm">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Programa */}
      {modules.length > 0 && (
        <section id="programa" className="section-y scroll-mt-20 bg-paper">
          <div className="container-x grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span data-reveal="fade" className="eyebrow text-royal">
                  Programa
                </span>
                <SplitReveal className="display-lg mt-6 text-balance text-ink">
                  {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}, <span className="serif-accent text-royal">passo a passo.</span>
                </SplitReveal>
                {course.duration && <p data-reveal className="mt-6 text-lg text-tertiary">Duração total: {course.duration}.</p>}
              </div>
            </div>
            <ol className="border-t border-line lg:col-span-8">
              {modules.map((m, i) => (
                <li key={`${m.title}-${i}`} data-reveal="up" data-reveal-delay={(i % 4) * 0.04} className="grid gap-4 border-b border-line py-7 sm:grid-cols-[4rem_1fr]">
                  <span className="text-sm font-semibold text-royal tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-xl leading-snug font-semibold tracking-tight text-ink sm:text-2xl">{m.title}</h3>
                    {m.topics.length > 0 && (
                      <ul className="mt-4 grid gap-2 text-tertiary">
                        {m.topics.map((t) => (
                          <li key={t} className="flex gap-3">
                            <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-tertiary" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Formadores */}
      {trainers.length > 0 && (
        <section id="formadores" className="section-y scroll-mt-20 bg-background">
          <div className="container-x">
            <span data-reveal="fade" className="eyebrow text-royal">
              {trainers.length > 1 ? 'Formadores e oradores' : 'Formador'}
            </span>
            <SplitReveal className="display-lg mt-6 max-w-3xl text-balance text-ink">
              Quem dá <span className="serif-accent text-royal">este curso.</span>
            </SplitReveal>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: '1200px' }}>
              {trainers.map((t, i) => (
                <li key={t.id} data-reveal="up" data-reveal-delay={(i % 4) * 0.06}>
                  <TrainerCard t={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Turmas e inscrição */}
      <section id="inscricao" className="section-y relative scroll-mt-20 overflow-clip bg-ink text-white">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
        <div className="container-x relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span data-reveal="fade" className="eyebrow text-accent">
              {open ? 'Inscrição' : 'Próximas edições'}
            </span>
            <SplitReveal className="display-lg mt-6 text-balance">
              {available.length ? (
                <>
                  Reserve o seu <span className="serif-accent text-white/60">lugar.</span>
                </>
              ) : (
                <>
                  Sem turmas abertas <span className="serif-accent text-white/60">neste momento.</span>
                </>
              )}
            </SplitReveal>
            {available.length > 0 ? (
              <ol className="mt-10 grid gap-5">
                {ENROLL_STEPS.map((step, i) => (
                  <li key={step.title} data-reveal="up" data-reveal-delay={i * 0.05} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-accent">{i + 1}</span>
                    <span>
                      <span className="block font-semibold">{step.title}</span>
                      <span className="block text-sm text-white/60">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p data-reveal className="mt-6 max-w-md text-lg text-white/70">
                {course.status === 'done'
                  ? 'Esta edição já foi realizada. Deixe o seu contacto e avisamos quando houver nova data.'
                  : 'As datas ainda não estão marcadas. Deixe o seu contacto e avisamos quando abrirem inscrições.'}
              </p>
            )}
            {course.certificate && s.candidacy_text && (
              <div data-reveal className="mt-10 rounded-[1.5rem] bg-white/5 p-6 ring-1 ring-white/10">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Award className="h-5 w-5 text-accent" aria-hidden /> {s.candidacy_title}
                </h3>
                <div className="mt-3 grid gap-2 text-sm leading-relaxed text-white/65">
                  {lines(s.candidacy_text).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div data-reveal="up" className="rounded-[2rem] bg-paper p-6 text-ink sm:p-10 lg:col-span-7">
            {available.length > 0 && methods.length > 0 ? (
              <EnrollForm
                slug={course.slug}
                courseTitle={course.title}
                price={Number(course.price) || 0}
                currency={course.currency}
                methods={methods.map((m) => ({ id: m.id, name: m.name, type: m.type }))}
                sessions={available.map((x) => ({
                  id: x.id,
                  dates: `${formatRange(x.startDate, x.endDate).full} ${x.startDate.slice(0, 4)}`,
                  location: x.location ?? course.venue ?? 'Presencial',
                  remaining: x.remaining,
                }))}
              />
            ) : (
              <div className="flex flex-col items-start gap-5 py-6">
                <h3 className="text-2xl font-semibold tracking-tight">Quero ser avisado</h3>
                <p className="text-tertiary">Envie-nos o seu contacto com o nome do curso e avisamos assim que houver data.</p>
                <Link href={`/contacto?assunto=${encodeURIComponent(`Aviso de nova turma: ${course.title}`)}`} className="btn btn-dark">
                  Deixar contacto <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <p className="text-sm text-tertiary">
                  Para a sua equipa, peça uma{' '}
                  <Link href="/empresas#proposta" className="font-semibold text-royal underline-offset-4 hover:underline">
                    formação à medida
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Perguntas frequentes */}
      {faq.length > 0 && (
        <section id="faq" className="section-y scroll-mt-20 bg-paper">
          <div className="container-x grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span data-reveal="fade" className="eyebrow text-royal">
                Perguntas frequentes
              </span>
              <SplitReveal className="display-lg mt-6 text-balance text-ink">
                Antes de se <span className="serif-accent text-royal">inscrever.</span>
              </SplitReveal>
            </div>
            <div className="border-t border-line lg:col-span-8">
              {faq.map((f) => (
                <details key={f.q} data-reveal="up" className="group border-b border-line">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition-transform duration-500 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-6 leading-relaxed whitespace-pre-line text-tertiary">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }}
          />
        </section>
      )}

      {/* Galeria */}
      {gallery.length > 0 && (
        <section id="galeria" className="section-y scroll-mt-20 bg-background">
          <div className="container-x">
            <span data-reveal="fade" className="eyebrow text-royal">
              Galeria
            </span>
            <SplitReveal className="display-lg mt-6 mb-12 max-w-3xl text-balance text-ink">
              Edições <span className="serif-accent text-royal">anteriores.</span>
            </SplitReveal>
            <CourseGallery images={gallery} />
          </div>
        </section>
      )}

      {/* Outros cursos */}
      {relatedList.length > 0 && (
        <section className="section-y bg-paper">
          <div className="container-x">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SplitReveal className="display-md text-balance text-ink">
                {related.length ? (
                  <>
                    Mais cursos de <span className="serif-accent text-royal">{course.area}.</span>
                  </>
                ) : (
                  <>
                    Outros <span className="serif-accent text-royal">cursos.</span>
                  </>
                )}
              </SplitReveal>
              <Link data-reveal href="/cursos" className="btn btn-outline-dark self-start sm:self-auto">
                Ver todos <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedList.map((c, i) => (
                <li key={c.id} data-reveal="up" data-reveal-delay={i * 0.06}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
