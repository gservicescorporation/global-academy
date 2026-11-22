import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { CourseExplorer, type ExplorerItem, type Option } from '@/components/courses/CourseExplorer';
import { PageHero } from '@/components/site/PageHero';
import type { Course } from '@/lib/entities';
import { getCourses, getUpcomingSessions } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Todos os cursos da academia: seguros, gestão e liderança. Pesquise e filtre por área, modalidade, nível, data e preço.',
  alternates: { canonical: '/cursos' },
};

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Valor "redondo" para os limites dos intervalos de preço (ex.: 47 300 → 50 000). */
function roundNice(n: number) {
  const p = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.ceil(n / p) * p;
}

/** Intervalos de preço calculados a partir dos preços reais (tercis). */
function priceBuckets(courses: Course[]) {
  const priced = courses.filter((c) => Number(c.price) > 0).sort((a, b) => a.price - b.price);
  const bucketOf = new Map<string, string>();
  const options: Option[] = [];
  const currency = priced[0]?.currency ?? 'AOA';
  const sameCurrency = priced.every((c) => c.currency === currency);

  if (priced.length >= 3 && sameCurrency) {
    const t1 = roundNice(priced[Math.floor(priced.length / 3)].price);
    const t2 = roundNice(priced[Math.floor((2 * priced.length) / 3)].price);
    const ranges = t1 < t2 ? [`ate-${t1}`, `${t1}-${t2}`, `mais-${t2}`] : [`ate-${t1}`, `mais-${t1}`];
    for (const c of priced) {
      bucketOf.set(c.id, c.price <= t1 ? ranges[0] : ranges.length === 3 && c.price <= t2 ? ranges[1] : ranges[ranges.length - 1]);
    }
    options.push({ value: ranges[0], label: `Até ${formatPrice(t1, currency)}` });
    if (ranges.length === 3) options.push({ value: ranges[1], label: `${formatPrice(t1, currency)} – ${formatPrice(t2, currency)}` });
    options.push({ value: ranges[ranges.length - 1], label: `Mais de ${formatPrice(ranges.length === 3 ? t2 : t1, currency)}` });
  } else if (priced.length > 0) {
    for (const c of priced) bucketOf.set(c.id, 'com-preco');
    options.push({ value: 'com-preco', label: 'Com preço indicado' });
  }
  if (courses.some((c) => !Number(c.price))) options.push({ value: 'consulta', label: 'Sob consulta' });
  return { bucketOf, options };
}

export default async function CoursesPage() {
  const [courses, sessions] = await Promise.all([getCourses(), getUpcomingSessions()]);

  const next = new Map<string, string>();
  for (const s of sessions) if (!next.has(s.courseId)) next.set(s.courseId, s.startDate);

  const { bucketOf, options: prices } = priceBuckets(courses);
  const uniq = (values: (string | null)[]) => [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'pt'));
  const areas = uniq(courses.map((c) => c.area?.trim() ?? null)).map((v) => ({ value: v, label: v }));
  const levels = uniq(courses.map((c) => c.level)).map((v) => ({ value: v, label: v }));

  const items: ExplorerItem[] = courses.map((c) => {
    const mod = fold(c.modality ?? '');
    const modes: ExplorerItem['modes'] = [];
    if (mod.includes('presencial') || !mod.includes('online')) modes.push('presencial');
    if (mod.includes('online')) modes.push('online');
    return {
      id: c.id,
      title: c.title,
      text: fold([c.title, c.shortDescription, c.area, c.description].filter(Boolean).join(' ')),
      area: c.area?.trim() || null,
      modes,
      level: c.level,
      status: c.status,
      price: Number(c.price) || 0,
      priceBucket: bucketOf.get(c.id) ?? 'consulta',
      nextDate: next.get(c.id) ?? null,
      position: c.position,
    };
  });

  const cards: Record<string, ReactNode> = Object.fromEntries(courses.map((c) => [c.id, <CourseCard key={c.id} course={c} headingLevel="h2" />]));

  return (
    <main>
      <PageHero
        eyebrow="Cursos"
        title={
          <>
            Todos os cursos, <span className="hl">num só lugar.</span>
          </>
        }
        text="Pesquise pelo tema ou filtre por área, modalidade, nível, data e preço. Cada curso mostra a duração, o preço e as próximas turmas."
      />
      <section className="section-y bg-background pt-10 sm:pt-12">
        <div className="container-x">
          {courses.length === 0 ? (
            <p className="rounded-[1.75rem] border border-dashed border-line p-12 text-center text-tertiary">Ainda não há cursos publicados.</p>
          ) : (
            <Suspense
              fallback={
                <ul className="mt-28 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => (
                    <li key={c.id}>{cards[c.id]}</li>
                  ))}
                </ul>
              }
            >
              <CourseExplorer items={items} cards={cards} areas={areas} levels={levels} prices={prices} />
            </Suspense>
          )}
        </div>
      </section>
    </main>
  );
}
