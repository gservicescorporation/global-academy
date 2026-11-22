import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import type { Enrollment, EnrollmentStatus } from '@/lib/entities';
import { sendPaidEmail } from '@/lib/payments/sync';
import { assertAdmin, InputError } from './guard';

export const ENROLLMENT_STATUS: Record<EnrollmentStatus, { label: string; tone: string }> = {
  pending: { label: 'Pendente', tone: 'bg-gold-soft/60 text-ink' },
  paid: { label: 'Pago', tone: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', tone: 'bg-red-100 text-red-800' },
};

const filterSchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  status: z.enum(['pending', 'paid', 'cancelled', '']).optional().default(''),
  course: z.string().uuid().optional().or(z.literal('')).default(''),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).default(''),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).default(''),
});
export type EnrollmentFilters = z.infer<typeof filterSchema>;

export async function listEnrollments(raw: Record<string, unknown>, limit = 500) {
  await assertAdmin();
  const f = filterSchema.safeParse(raw).success ? filterSchema.parse(raw) : filterSchema.parse({});
  const ds = await getDb();
  const qb = ds.getRepository('Enrollment').createQueryBuilder('e').orderBy('e.createdAt', 'DESC').take(limit);
  if (f.status) qb.andWhere('e.status = :status', { status: f.status });
  if (f.course) qb.andWhere('e.courseId = :course', { course: f.course });
  if (f.from) qb.andWhere('e.createdAt >= :from', { from: `${f.from}T00:00:00` });
  if (f.to) qb.andWhere('e.createdAt <= :to', { to: `${f.to}T23:59:59` });
  if (f.q) {
    qb.andWhere(
      '(e.fullName ILIKE :q OR e.email ILIKE :q OR e.reference ILIKE :q OR e.company ILIKE :q OR e.phone ILIKE :q OR e.courseTitle ILIKE :q)',
      { q: `%${f.q.replace(/[%_\\]/g, '\\$&')}%` }
    );
  }
  return { filters: f, rows: (await qb.getMany()) as Enrollment[] };
}

export async function getEnrollment(id: string) {
  await assertAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const ds = await getDb();
  return (await ds.getRepository('Enrollment').findOne({ where: { id }, relations: { paymentMethod: true } })) as Enrollment | null;
}

/** Muda o estado manualmente (ex.: transferência confirmada). Envia o email de pagamento ao passar a "Pago". */
export async function setEnrollmentStatus(id: string, status: string) {
  await assertAdmin();
  if (!['pending', 'paid', 'cancelled'].includes(status)) throw new InputError('Estado inválido.');
  const ds = await getDb();
  const e = (await ds.getRepository('Enrollment').findOne({ where: { id } })) as Enrollment | null;
  if (!e) throw new InputError('Inscrição não encontrada.');
  if (e.status === status) return;
  await ds.getRepository('Enrollment').update(id, { status });
  if (status === 'paid') await sendPaidEmail(e);
  revalidatePath('/', 'layout');
}

/* ------------------------------ CSV ------------------------------ */

const csvCell = (v: unknown) => {
  let s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v);
  // Evita injeção de fórmulas ao abrir no Excel.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function enrollmentsCsv(rows: Enrollment[]) {
  const head = ['Referência', 'Data', 'Estado', 'Curso', 'Turma', 'Nome', 'Email', 'Telefone', 'Empresa', 'NIF', 'Participantes', 'Total', 'Moeda', 'Pagamento', 'Ref. pagamento'];
  const lines = rows.map((e) =>
    [
      e.reference,
      new Date(e.createdAt).toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' }),
      ENROLLMENT_STATUS[e.status]?.label ?? e.status,
      e.courseTitle,
      e.sessionLabel,
      e.fullName,
      e.email,
      e.phone,
      e.company,
      e.taxId,
      e.participants,
      Number(e.amount).toFixed(2).replace('.', ','),
      e.currency,
      e.paymentMethodName,
      e.paymentRef,
    ]
      .map(csvCell)
      .join(';')
  );
  // BOM para o Excel abrir os acentos corretamente; ";" como separador (configuração regional PT).
  return '﻿' + [head.join(';'), ...lines].join('\r\n');
}

/* ------------------------------ Visão geral ------------------------------ */

export async function dashboardStats() {
  await assertAdmin();
  const ds = await getDb();
  const [totals] = (await ds.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'paid')::int AS paid,
      COUNT(*) FILTER (WHERE "createdAt" >= now() - interval '30 days')::int AS last30,
      COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND currency = 'AOA'), 0)::float AS revenue,
      COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND currency = 'AOA' AND "createdAt" >= date_trunc('month', now())), 0)::float AS revenue_month,
      COALESCE(SUM(amount) FILTER (WHERE status = 'pending' AND currency = 'AOA'), 0)::float AS receivable
    FROM enrollments`)) as { pending: number; paid: number; last30: number; revenue: number; revenue_month: number; receivable: number }[];

  const upcoming = (await ds.query(`
    SELECT s.id, s."startDate"::text AS start, s."endDate"::text AS "end", s.location, s.seats, c.title, c.id AS course_id,
      COALESCE((SELECT SUM(participants) FROM enrollments e WHERE e.session_id = s.id AND e.status <> 'cancelled'), 0)::int AS taken
    FROM course_sessions s JOIN courses c ON c.id = s.course_id
    WHERE s."endDate" >= CURRENT_DATE
    ORDER BY s."startDate" ASC LIMIT 6`)) as { id: string; start: string; end: string; location: string | null; seats: number; title: string; course_id: string; taken: number }[];

  const drafts = (await ds.query(`SELECT id, title FROM courses WHERE published = false ORDER BY "createdAt" DESC LIMIT 6`)) as { id: string; title: string }[];
  const [{ unread }] = (await ds.query(`SELECT COUNT(*)::int AS unread FROM contact_messages WHERE read = false`)) as { unread: number }[];

  // Inscrições por semana (últimas 12) para o gráfico.
  const weekly = (await ds.query(`
    SELECT to_char(w, 'YYYY-MM-DD') AS week, COALESCE(n, 0)::int AS n FROM generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), interval '1 week') w
    LEFT JOIN (SELECT date_trunc('week', "createdAt") AS wk, COUNT(*) AS n FROM enrollments GROUP BY 1) t ON t.wk = w
    ORDER BY w`)) as { week: string; n: number }[];

  const recent = (await ds.getRepository('Enrollment').find({ order: { createdAt: 'DESC' }, take: 6 })) as Enrollment[];
  return { totals, upcoming, drafts, unread, weekly, recent };
}

/** Pagamentos: inscrições com dados de pagamento (gateway ou manual). */
export async function listPayments(status: string) {
  await assertAdmin();
  const ds = await getDb();
  const qb = ds.getRepository('Enrollment').createQueryBuilder('e').orderBy('e.createdAt', 'DESC').take(300);
  if (['pending', 'paid', 'cancelled'].includes(status)) qb.where('e.status = :status', { status });
  return (await qb.getMany()) as Enrollment[];
}
