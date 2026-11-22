import { revalidatePath } from 'next/cache';
import { In, Not } from 'typeorm';
import { z } from 'zod';
import { courseContent, type CourseContent } from '@/lib/course-content';
import { getDb } from '@/lib/db';
import type { Course, CourseSession } from '@/lib/entities';
import { slugify, todayISO } from '@/lib/utils';
import { assertAdmin, InputError, zodFields } from './guard';

/* ------------------------------ Leitura ------------------------------ */

export type CourseRow = Pick<Course, 'id' | 'slug' | 'title' | 'status' | 'area' | 'imageUrl' | 'price' | 'currency' | 'featured' | 'published' | 'position'> & {
  nextSession: string | null;
  enrollments: number;
};

export async function listCoursesAdmin(): Promise<CourseRow[]> {
  await assertAdmin();
  const ds = await getDb();
  const courses = (await ds.getRepository('Course').find({ order: { position: 'ASC', createdAt: 'DESC' } })) as Course[];
  const next = (await ds.query(
    `SELECT course_id AS id, MIN("startDate")::text AS d FROM course_sessions WHERE "endDate" >= $1 GROUP BY course_id`,
    [todayISO()]
  )) as { id: string; d: string }[];
  const counts = (await ds.query(
    `SELECT course_id AS id, COALESCE(SUM(participants),0)::int AS n FROM enrollments WHERE status <> 'cancelled' AND course_id IS NOT NULL GROUP BY course_id`
  )) as { id: string; n: number }[];
  const nextMap = new Map(next.map((r) => [r.id, r.d]));
  const countMap = new Map(counts.map((r) => [r.id, Number(r.n)]));
  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    status: c.status,
    area: c.area,
    imageUrl: c.imageUrl,
    price: c.price,
    currency: c.currency,
    featured: c.featured,
    published: c.published,
    position: c.position,
    nextSession: nextMap.get(c.id) ?? null,
    enrollments: countMap.get(c.id) ?? 0,
  }));
}

export type SessionInput = { id?: string; startDate: string; endDate: string; location: string; seats: number; published: boolean; taken?: number };

export type CourseForm = {
  id: string | null;
  title: string;
  slug: string;
  status: Course['status'];
  area: string;
  shortDescription: string;
  description: string;
  focus: string;
  imageUrl: string;
  duration: string;
  dateLabel: string;
  modality: string;
  venue: string;
  language: string;
  certificate: string;
  level: string;
  price: number;
  currency: string;
  featured: boolean;
  published: boolean;
  position: number;
  trainerIds: string[];
  content: CourseContent;
  sessions: SessionInput[];
};

export function blankCourse(): CourseForm {
  return {
    id: null,
    title: '',
    slug: '',
    status: 'soon',
    area: '',
    shortDescription: '',
    description: '',
    focus: '',
    imageUrl: '',
    duration: '',
    dateLabel: '',
    modality: 'Presencial',
    venue: 'Luanda',
    language: 'Português',
    certificate: '',
    level: '',
    price: 0,
    currency: 'AOA',
    featured: false,
    published: false,
    position: 0,
    trainerIds: [],
    content: { objectives: [], audience: [], modules: [], faq: [], gallery: [] },
    sessions: [],
  };
}

export async function getCourseForm(id: string): Promise<CourseForm | null> {
  await assertAdmin();
  const ds = await getDb();
  const c = (await ds.getRepository('Course').findOne({ where: { id } })) as Course | null;
  if (!c) return null;
  const sessions = (await ds.getRepository('CourseSession').find({ where: { courseId: id }, order: { startDate: 'ASC' } })) as CourseSession[];
  const taken = (await ds.query(
    `SELECT session_id AS id, COALESCE(SUM(participants),0)::int AS n FROM enrollments WHERE status <> 'cancelled' AND course_id = $1 GROUP BY session_id`,
    [id]
  )) as { id: string; n: number }[];
  const takenMap = new Map(taken.map((r) => [r.id, Number(r.n)]));
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    area: c.area ?? '',
    shortDescription: c.shortDescription,
    description: c.description ?? '',
    focus: c.focus ?? '',
    imageUrl: c.imageUrl ?? '',
    duration: c.duration ?? '',
    dateLabel: c.dateLabel ?? '',
    modality: c.modality ?? '',
    venue: c.venue ?? '',
    language: c.language ?? '',
    certificate: c.certificate ?? '',
    level: c.level ?? '',
    price: Number(c.price) || 0,
    currency: c.currency,
    featured: c.featured,
    published: c.published,
    position: c.position,
    trainerIds: c.trainerIds ?? [],
    content: courseContent(c),
    sessions: sessions.map((s) => ({
      id: s.id,
      startDate: s.startDate,
      endDate: s.endDate,
      location: s.location ?? '',
      seats: s.seats,
      published: s.published,
      taken: takenMap.get(s.id) ?? 0,
    })),
  };
}

/* ------------------------------ Escrita ------------------------------ */

const str = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`);
const list = (max: number) => z.array(z.string().trim().max(max)).transform((l) => l.filter(Boolean));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.');

const courseSchema = z.object({
  title: str(200).min(3, 'Indique o título.'),
  slug: str(200),
  status: z.enum(['soon', 'open', 'done']),
  area: str(120),
  shortDescription: str(400).min(10, 'Escreva uma descrição curta (mín. 10 caracteres).'),
  description: str(8000),
  focus: str(1000),
  imageUrl: str(500),
  duration: str(120),
  dateLabel: str(120),
  modality: str(80),
  venue: str(200),
  language: str(60),
  certificate: str(120),
  level: str(60),
  price: z.coerce.number({ message: 'Preço inválido.' }).min(0, 'O preço não pode ser negativo.').max(1e10),
  currency: z.enum(['AOA', 'EUR', 'USD']),
  featured: z.boolean(),
  published: z.boolean(),
  position: z.coerce.number().int().min(-9999).max(9999),
  trainerIds: z.array(z.string().uuid()).max(50),
  content: z.object({
    objectives: list(300),
    audience: list(200),
    modules: z
      .array(z.object({ title: str(200), topics: list(300) }))
      .transform((m) => m.filter((x) => x.title)),
    faq: z
      .array(z.object({ q: str(300), a: str(3000) }))
      .transform((f) => f.filter((x) => x.q && x.a)),
    gallery: list(500),
  }),
  sessions: z
    .array(
      z
        .object({
          id: z.string().uuid().optional(),
          startDate: isoDate,
          endDate: isoDate,
          location: str(200),
          seats: z.coerce.number({ message: 'Vagas inválidas.' }).int().min(1, 'Pelo menos 1 vaga.').max(1000),
          published: z.boolean(),
        })
        .refine((s) => s.endDate >= s.startDate, { path: ['endDate'], message: 'A data de fim é anterior ao início.' })
    )
    .max(100),
});

/** Converte o conteúdo estruturado para os campos de texto antigos (compatibilidade). */
function legacyText(c: CourseContent) {
  return {
    objectives: c.objectives.join('\n') || null,
    audience: c.audience.join('\n') || null,
    program: c.modules.map((m) => [m.topics.length ? `# ${m.title}` : m.title, ...m.topics].join('\n')).join('\n') || null,
    faq: c.faq.map((f) => `${f.q}\n${f.a}`).join('\n\n') || null,
    gallery: c.gallery.join('\n') || null,
  };
}

export async function saveCourse(id: string | null, input: unknown): Promise<{ id: string; slug: string }> {
  await assertAdmin();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) throw new InputError('Verifique os campos assinalados.', zodFields(parsed.error));
  const d = parsed.data;
  const ds = await getDb();

  const result = await ds.transaction(async (m) => {
    const courses = m.getRepository('Course');
    if (id && !(await courses.findOne({ where: { id } }))) throw new InputError('Este curso já não existe.');

    let slug = slugify(d.slug || d.title);
    const clash = (await courses.findOne({ where: id ? { slug, id: Not(id) } : { slug } })) as Course | null;
    if (clash) {
      if (d.slug) throw new InputError('Já existe um curso com este endereço.', { slug: 'Endereço já usado por outro curso.' });
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const row = {
      ...(id ? { id } : {}),
      title: d.title,
      slug,
      status: d.status,
      area: d.area || null,
      shortDescription: d.shortDescription,
      description: d.description || null,
      focus: d.focus || null,
      imageUrl: d.imageUrl || null,
      duration: d.duration || null,
      dateLabel: d.dateLabel || null,
      modality: d.modality || null,
      venue: d.venue || null,
      language: d.language || null,
      certificate: d.certificate || null,
      level: d.level || null,
      price: d.price,
      currency: d.currency,
      featured: d.featured,
      published: d.published,
      position: d.position,
      trainerIds: d.trainerIds.length ? d.trainerIds : null,
      content: d.content,
      ...legacyText(d.content),
    };
    const saved = (await courses.save(row)) as Course;

    // Turmas: atualiza/cria as enviadas; apaga as removidas só se não tiverem inscrições.
    const sessions = m.getRepository('CourseSession');
    const keep = d.sessions.map((s) => s.id).filter(Boolean) as string[];
    const removed = (await sessions.find({ where: { courseId: saved.id, ...(keep.length ? { id: Not(In(keep)) } : {}) } })) as CourseSession[];
    if (removed.length) {
      const [{ n }] = (await m.query(`SELECT COUNT(*)::int AS n FROM enrollments WHERE session_id = ANY($1::uuid[])`, [removed.map((r) => r.id)])) as { n: number }[];
      if (Number(n) > 0) {
        throw new InputError('Uma das turmas removidas já tem inscrições. Despublique-a em vez de a apagar.', { sessions: 'Turma com inscrições.' });
      }
      await sessions.delete(removed.map((r) => r.id));
    }
    for (const s of d.sessions) {
      if (s.id) {
        const own = await sessions.findOne({ where: { id: s.id, courseId: saved.id } });
        if (!own) throw new InputError('Turma inválida.');
      }
      await sessions.save({ ...(s.id ? { id: s.id } : {}), courseId: saved.id, startDate: s.startDate, endDate: s.endDate, location: s.location || null, seats: s.seats, published: s.published });
    }
    return { id: saved.id, slug: saved.slug };
  });

  revalidatePath('/', 'layout');
  return result;
}

export async function duplicateCourse(id: string) {
  const form = await getCourseForm(id);
  if (!form) throw new InputError('Curso não encontrado.');
  return saveCourse(null, {
    ...form,
    title: `${form.title} (cópia)`,
    slug: '',
    published: false,
    featured: false,
    sessions: [],
  });
}

export async function deleteCourse(id: string) {
  await assertAdmin();
  const ds = await getDb();
  const [{ n }] = (await ds.query(`SELECT COUNT(*)::int AS n FROM enrollments WHERE course_id = $1 AND status <> 'cancelled'`, [id])) as { n: number }[];
  if (Number(n) > 0) throw new InputError('Este curso tem inscrições. Despublique-o em vez de o apagar.');
  await ds.getRepository('Course').delete(id);
  revalidatePath('/', 'layout');
}

export async function toggleCourse(id: string, field: 'published' | 'featured') {
  await assertAdmin();
  const ds = await getDb();
  const repo = ds.getRepository('Course');
  const c = (await repo.findOne({ where: { id } })) as Course | null;
  if (!c) throw new InputError('Curso não encontrado.');
  await repo.update(id, { [field]: !c[field] });
  revalidatePath('/', 'layout');
  return !c[field];
}

export async function reorderCourses(ids: string[]) {
  await assertAdmin();
  const parsed = z.array(z.string().uuid()).max(500).safeParse(ids);
  if (!parsed.success) throw new InputError('Ordem inválida.');
  const ds = await getDb();
  await ds.transaction(async (m) => {
    for (const [i, id] of parsed.data.entries()) await m.getRepository('Course').update(id, { position: i + 1 });
  });
  revalidatePath('/', 'layout');
}
