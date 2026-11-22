import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
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

  return (
    <article
      className={`group relative flex h-full flex-col rounded-[1.75rem] bg-white p-2.5 ring-1 ring-line transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-lift ${className}`}
    >
      <div className="relative aspect-[16/11] overflow-hidden rounded-[1.4rem] bg-brand-100">
        {course.imageUrl ? (
          <Img src={course.imageUrl} alt="" fill sizes={sizes} className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
        ) : (
          <CourseCover title={course.title} area={course.area} />
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${st.cls}`}>{st.label}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3.5 pt-5 pb-3">
        {course.area && <span className="text-sm font-semibold text-brand-700">{course.area}</span>}
        <Heading className="font-head text-[1.4rem] leading-tight font-semibold tracking-tight text-ink">
          <Link href={`/cursos/${course.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {course.title}
          </Link>
        </Heading>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-tertiary">{course.shortDescription}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-tertiary">
          {course.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-500" aria-hidden /> {course.duration}
            </span>
          )}
          {course.modality && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-500" aria-hidden /> {course.modality}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl bg-brand-50 p-3 pl-4">
          <div>
            <span className="block text-xs text-tertiary">Por participante</span>
            <span className="font-head text-lg font-semibold tracking-tight text-ink">{formatPrice(course.price, course.currency)}</span>
          </div>
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-500 ease-out-expo group-hover:scale-110">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
          </span>
        </div>
      </div>
      {/* Foco visível no cartão quando o link do título tem foco. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-brand-500 group-has-[:focus-visible]:ring-[3px]" />
    </article>
  );
}

/** Capa gerada quando o curso ainda não tem imagem: anéis e letra inicial da área. */
export function CourseCover({ title, area }: { title: string; area?: string | null }) {
  const letter = (area || title).trim().charAt(0).toUpperCase();
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300">
      <div className="dots absolute inset-0 opacity-70" />
      <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full border-[18px] border-white/40" />
      <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-white/50" />
      <span className="absolute bottom-3 left-5 font-head text-[7rem] leading-none font-semibold tracking-tighter text-white/80 sm:text-[8rem]">{letter}</span>
    </div>
  );
}
