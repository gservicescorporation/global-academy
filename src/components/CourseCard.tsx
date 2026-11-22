import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Course } from '@/lib/entities';
import { COURSE_STATUS, formatPrice } from '@/lib/utils';
import { Img } from './site/Img';

/** Cartão de curso. O cartão inteiro é clicável (link estendido no título). */
export function CourseCard({
  course,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className = '',
  headingLevel = 'h3',
}: {
  course: Course;
  sizes?: string;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const st = COURSE_STATUS[course.status];
  const Heading = headingLevel;
  const date = course.dateLabel && course.dateLabel.toLowerCase() !== st.label.toLowerCase() ? course.dateLabel : null;
  const meta = [course.duration, course.modality, date].filter(Boolean) as string[];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-paper p-3 ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(7_11_22/0.35)] ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-ink">
        {course.imageUrl ? (
          <Img
            src={course.imageUrl}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
          />
        ) : (
          <CourseCover title={course.title} area={course.area} />
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 pt-6 pb-3">
        {course.area && <span className="text-xs font-semibold tracking-[0.18em] text-royal uppercase">{course.area}</span>}
        <Heading className="text-[1.375rem] leading-tight font-semibold tracking-tight text-ink">
          <Link href={`/cursos/${course.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {course.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-[15px] leading-relaxed text-tertiary">{course.shortDescription}</p>
        {meta.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-2">
            {meta.map((m) => (
              <li key={m} className="rounded-full bg-background px-3 py-1 text-xs font-medium text-tertiary">
                {m}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5">
          <div>
            <span className="block text-xs text-tertiary">Por participante</span>
            <span className="text-lg font-bold tracking-tight text-ink">{formatPrice(course.price, course.currency)}</span>
          </div>
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors duration-500 group-hover:bg-royal"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
          </span>
        </div>
      </div>
      {/* Foco visível no cartão quando o link do título tem foco. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-accent group-has-[:focus-visible]:ring-[3px]" />
    </article>
  );
}

/** Capa gerada quando o curso ainda não tem imagem. */
export function CourseCover({ title, area }: { title: string; area?: string | null }) {
  const letter = (area || title).trim().charAt(0).toUpperCase();
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink">
      <div className="grid-lines absolute inset-0 opacity-80" />
      <div className="absolute -right-1/4 -bottom-1/2 h-[140%] w-[90%] rounded-full bg-royal/45 blur-3xl" />
      <span className="serif-accent absolute right-6 bottom-[-0.15em] text-[9rem] leading-none text-white/15 sm:text-[11rem]">{letter}</span>
    </div>
  );
}
