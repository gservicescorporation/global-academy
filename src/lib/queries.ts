import { MoreThanOrEqual, type ObjectLiteral, type Repository } from 'typeorm';
import { getDb } from './db';
import { SETTINGS } from './settings-defs';
import { todayISO } from './utils';
import type { Course, CourseSession, HeroSlide, Highlight, Partner, PaymentMethod, Testimonial, Trainer, WhyItem } from './entities';

async function repo<T>(name: string): Promise<Repository<T & ObjectLiteral>> {
  return (await getDb()).getRepository(name) as unknown as Repository<T & ObjectLiteral>;
}

export type SessionWithSeats = CourseSession & { remaining: number };

export async function getSettings(): Promise<Record<string, string>> {
  const ds = await getDb();
  const rows = (await ds.getRepository('Setting').find()) as { key: string; value: string | null }[];
  const map: Record<string, string> = {};
  for (const d of SETTINGS) map[d.name] = d.default;
  for (const r of rows) if (r.value != null && r.value !== '') map[r.key] = r.value;
  return map;
}

export async function getFeaturedCourses(limit = 3): Promise<Course[]> {
  return (await repo<Course>('Course')).find({
    where: { published: true, featured: true }, order: { position: 'ASC', createdAt: 'DESC' }, take: limit,
  }) as unknown as Promise<Course[]>;
}

export async function getCourses(): Promise<Course[]> {
  return (await repo<Course>('Course')).find({ where: { published: true }, order: { position: 'ASC', createdAt: 'DESC' } }) as unknown as Promise<Course[]>;
}

export async function getTrainersByIds(ids: string[] | null | undefined): Promise<Trainer[]> {
  if (!ids?.length) return [];
  const all = await getTrainers();
  return ids.map((id) => all.find((t) => t.id === id)).filter(Boolean) as Trainer[];
}

export async function getSoonCourses(limit = 4): Promise<Course[]> {
  return (await (await repo<Course>('Course')).find({
    where: { published: true, status: 'soon' }, order: { position: 'ASC' }, take: limit,
  })) as unknown as Course[];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return (await repo<Course>('Course')).findOne({ where: { slug, published: true } }) as unknown as Promise<Course | null>;
}

async function withSeats(sessions: CourseSession[]): Promise<SessionWithSeats[]> {
  if (!sessions.length) return [];
  const ds = await getDb();
  const rows = await ds.getRepository('Enrollment').createQueryBuilder('e')
    .select('e.session_id', 'sid').addSelect('COALESCE(SUM(e.participants),0)', 'taken')
    .where('e.session_id IN (:...ids)', { ids: sessions.map((s) => s.id) })
    .andWhere("e.status <> 'cancelled'").groupBy('e.session_id').getRawMany<{ sid: string; taken: string }>();
  const taken = new Map(rows.map((r) => [r.sid, Number(r.taken)]));
  return sessions.map((s) => ({ ...s, remaining: Math.max(0, s.seats - (taken.get(s.id) ?? 0)) }));
}

export async function getUpcomingSessions(opts: { limit?: number; courseId?: string } = {}): Promise<SessionWithSeats[]> {
  const ds = await getDb();
  const where: Record<string, unknown> = { published: true, endDate: MoreThanOrEqual(todayISO()) };
  if (opts.courseId) where.courseId = opts.courseId;
  const rows = (await ds.getRepository('CourseSession').find({
    where, relations: { course: true }, order: { startDate: 'ASC' }, take: opts.limit,
  })) as CourseSession[];
  return withSeats(rows.filter((s) => s.course?.published));
}

export async function getSessionWithSeats(id: string): Promise<SessionWithSeats | null> {
  const ds = await getDb();
  const s = (await ds.getRepository('CourseSession').findOne({ where: { id }, relations: { course: true } })) as CourseSession | null;
  if (!s) return null;
  return (await withSeats([s]))[0];
}

const byPosition = { order: { position: 'ASC' as const } };
export const getHighlights = async (): Promise<Highlight[]> => (await (await repo<Highlight>('Highlight')).find(byPosition)) as unknown as Highlight[];
export const getWhyItems = async (): Promise<WhyItem[]> => (await (await repo<WhyItem>('WhyItem')).find(byPosition)) as unknown as WhyItem[];
export const getTrainers = async (): Promise<Trainer[]> => (await (await repo<Trainer>('Trainer')).find(byPosition)) as unknown as Trainer[];
export const getPartners = async (): Promise<Partner[]> => (await (await repo<Partner>('Partner')).find(byPosition)) as unknown as Partner[];
export const getPaymentMethods = async (): Promise<PaymentMethod[]> =>
  (await (await repo<PaymentMethod>('PaymentMethod')).find({ where: { enabled: true }, order: { position: 'ASC' } })) as unknown as PaymentMethod[];

const publishedByPosition = { where: { published: true }, order: { position: 'ASC' as const } };
export const getHeroSlides = async (): Promise<HeroSlide[]> =>
  (await (await repo<HeroSlide>('HeroSlide')).find(publishedByPosition)) as unknown as HeroSlide[];
export const getTestimonials = async (): Promise<Testimonial[]> =>
  (await (await repo<Testimonial>('Testimonial')).find(publishedByPosition)) as unknown as Testimonial[];

/** Áreas de formação com o número de cursos publicados em cada uma. */
export async function getAreas(): Promise<{ name: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const c of await getCourses()) {
    const area = c.area?.trim();
    if (area) counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt'));
}
