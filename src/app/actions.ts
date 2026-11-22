'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getSettings } from '@/lib/queries';
import { emailLayout, emailRows, escapeHtml, sendEmail } from '@/lib/email';
import { appyPayConfigured, createAppyPayCharge } from '@/lib/payments/appypay';
import { absoluteUrl, formatPrice, formatRange, genReference, todayISO } from '@/lib/utils';
import type { CourseSession, Enrollment, PaymentDetails, PaymentMethod } from '@/lib/entities';

const enrollSchema = z
  .object({
    sessionId: z.string().uuid('Escolha uma turma.'),
    paymentMethodId: z.string().uuid('Escolha como vai pagar.'),
    participants: z.coerce.number({ message: 'Indique um número.' }).int('Indique um número inteiro.').min(1, 'Pelo menos 1 participante.').max(50, 'Máximo 50 por inscrição.'),
    fullName: z.string().trim().min(2, 'Indique o nome completo.').max(160),
    email: z.string().trim().email('Indique um email válido.').max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v.replace(/\D/g, '').length >= 9, 'Indique um telefone com pelo menos 9 dígitos.'),
    isCompany: z.enum(['0', '1']).default('0'),
    company: z.string().trim().max(200).optional().or(z.literal('')),
    taxId: z.string().trim().max(40).optional().or(z.literal('')),
  })
  .superRefine((d, ctx) => {
    if (d.isCompany === '1' && (d.company ?? '').length < 2) ctx.addIssue({ code: 'custom', path: ['company'], message: 'Indique o nome da empresa.' });
  });

class EnrollError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
  }
}

export async function enroll(slug: string, _prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get('website')) return { ok: true }; // honeypot
  if (await tooMany('enroll', 8)) return { ok: false, message: 'Demasiadas tentativas. Tente novamente daqui a alguns minutos.' };

  const parsed = enrollSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: 'Verifique os campos assinalados.' };
  const d = parsed.data;

  const ds = await getDb();
  const method = (await ds.getRepository('PaymentMethod').findOne({ where: { id: d.paymentMethodId, enabled: true } })) as PaymentMethod | null;
  if (!method) return { ok: false, errors: { paymentMethodId: 'Escolha um método de pagamento válido.' } };

  let saved: Enrollment;
  try {
    // Transação com bloqueio da turma: duas inscrições em simultâneo não ultrapassam as vagas.
    saved = await ds.transaction(async (m) => {
      await m.query('SELECT id FROM course_sessions WHERE id = $1 FOR UPDATE', [d.sessionId]);
      const session = (await m.getRepository('CourseSession').findOne({ where: { id: d.sessionId }, relations: { course: true } })) as CourseSession | null;
      const course = session?.course;
      if (!session || !course || course.slug !== slug || !course.published || !session.published || course.status === 'done' || session.endDate < todayISO()) {
        throw new EnrollError('sessionId', 'Esta turma já não está disponível. Escolha outra.');
      }
      const [{ taken }] = (await m.query(
        `SELECT COALESCE(SUM(participants), 0)::int AS taken FROM enrollments WHERE session_id = $1 AND status <> 'cancelled'`,
        [session.id]
      )) as { taken: number }[];
      const remaining = Math.max(0, session.seats - Number(taken));
      if (d.participants > remaining) {
        throw new EnrollError(
          'participants',
          remaining === 0 ? 'Esta turma esgotou entretanto. Escolha outra.' : `Restam ${remaining} ${remaining === 1 ? 'vaga' : 'vagas'} nesta turma.`
        );
      }
      return (await m.getRepository('Enrollment').save({
        reference: genReference(),
        courseId: course.id,
        sessionId: session.id,
        paymentMethodId: method.id,
        courseTitle: course.title,
        sessionLabel: `${formatRange(session.startDate, session.endDate).full} ${session.startDate.slice(0, 4)} · ${session.location ?? 'Presencial'}`,
        paymentMethodName: method.name,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        isCompany: d.isCompany === '1',
        company: d.isCompany === '1' ? d.company || null : null,
        taxId: d.isCompany === '1' ? d.taxId || null : null,
        participants: d.participants,
        amount: Number(course.price) * d.participants, // preço sempre do servidor
        currency: course.currency,
        status: 'pending',
      })) as Enrollment;
    });
  } catch (e) {
    if (e instanceof EnrollError) return { ok: false, errors: { [e.field]: e.message }, message: e.message };
    throw e;
  }

  // AppyPay (Multicaixa Express / referência). Se não estiver configurado ou falhar,
  // a inscrição fica pendente e a pessoa vê as instruções manuais do método.
  const repo = ds.getRepository('Enrollment');
  if ((method.type === 'express' || method.type === 'reference') && appyPayConfigured() && Number(saved.amount) > 0) {
    try {
      const charge = await createAppyPayCharge({
        method: method.type,
        amount: Number(saved.amount),
        currency: saved.currency,
        description: `${saved.courseTitle} (${d.participants}x) ${saved.reference}`,
        phone: d.phone,
        fullName: d.fullName,
        email: d.email,
      });
      const details: PaymentDetails = { provider: 'appypay', chargeId: charge.chargeId, ...charge.reference };
      await repo.update(saved.id, { paymentRef: charge.merchantTransactionId, paymentDetails: details });
      saved.paymentDetails = details;
    } catch (e) {
      console.error('[appypay] falha ao criar cobrança', e);
    }
  }

  await sendEnrollmentEmails(saved, method);
  revalidatePath('/', 'layout'); // vagas atualizadas nas páginas públicas
  redirect(`/inscricao/${saved.id}`);
}

async function sendEnrollmentEmails(e: Enrollment, method: PaymentMethod) {
  const s = await getSettings();
  const link = absoluteUrl(`/inscricao/${e.id}`);
  const rows: [string, unknown][] = [
    ['Referência', e.reference],
    ['Curso', e.courseTitle],
    ['Turma', e.sessionLabel],
    ['Participantes', e.participants],
    ['Total', formatPrice(e.amount, e.currency)],
    ['Pagamento', e.paymentMethodName],
  ];
  const pay = e.paymentDetails?.referenceNumber
    ? emailRows([
        ['Entidade', e.paymentDetails.entity],
        ['Referência de pagamento', e.paymentDetails.referenceNumber],
        ['Montante', formatPrice(e.amount, e.currency)],
      ])
    : e.paymentDetails
      ? `<p style="font-size:15px;line-height:1.6">Enviámos o pedido de pagamento para o seu Multicaixa Express. Abra a aplicação e aprove o pagamento.</p>`
      : `${method.instructions ? `<p style="font-size:15px;line-height:1.6;white-space:pre-line">${escapeHtml(method.instructions)}</p>` : ''}${
          method.details
            ? `<p style="font-size:15px;line-height:1.6;white-space:pre-line;background:#f6f7fb;padding:12px 16px;border-radius:12px">${escapeHtml(method.details)}</p>`
            : ''
        }`;

  await Promise.all([
    sendEmail({
      to: e.email,
      replyTo: s.contact_email || undefined,
      subject: `Inscrição ${e.reference} — ${e.courseTitle}`,
      html: emailLayout(
        'A sua inscrição foi registada',
        `<p style="font-size:15px;line-height:1.6">Olá ${escapeHtml(e.fullName.split(' ')[0])}, recebemos a sua inscrição. A vaga fica confirmada quando o pagamento for recebido.</p>
${emailRows(rows)}
<h2 style="font-size:17px;margin:28px 0 8px">Como pagar</h2>${pay}
<p style="margin-top:28px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#070b16;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold">Ver a inscrição</a></p>`,
        s.site_name
      ),
    }),
    s.contact_email
      ? sendEmail({
          to: s.contact_email,
          replyTo: e.email,
          subject: `Nova inscrição ${e.reference} — ${e.courseTitle}`,
          html: emailLayout(
            'Nova inscrição',
            emailRows([...rows, ['Nome', e.fullName], ['Email', e.email], ['Telefone', e.phone], ['Empresa', e.company], ['NIF', e.taxId]]),
            s.site_name
          ),
        })
      : Promise.resolve(false),
  ]);
}

/* ---------- Formulários públicos (contacto e proposta para empresas) ---------- */

export type FormState = { ok: boolean; errors?: Record<string, string>; message?: string };

const hits = new Map<string, number[]>();
/** Limite simples por IP (memória do processo): máx. `max` envios por `windowMs`. */
async function tooMany(scope: string, max = 5, windowMs = 10 * 60_000) {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'local';
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? 'form');
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

const text = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max, `Máximo ${max} caracteres.`);
const optionalText = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`).optional().or(z.literal(''));

const contactSchema = z.object({
  name: text(2, 160, 'Indique o seu nome.'),
  email: z.string().trim().email('Indique um email válido.').max(200),
  phone: optionalText(40),
  subject: optionalText(200),
  message: text(10, 4000, 'Escreva pelo menos 10 caracteres.'),
});

async function notifyTeam(subject: string, rows: [string, unknown][], replyTo: string) {
  const s = await getSettings();
  if (!s.contact_email) return;
  await sendEmail({ to: s.contact_email, subject, replyTo, html: emailLayout(subject, emailRows(rows), s.site_name) });
}

export async function sendContact(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get('website')) return { ok: true }; // honeypot: finge sucesso
  if (await tooMany('contact')) return { ok: false, message: 'Demasiados envios. Tente novamente daqui a alguns minutos.' };
  const parsed = contactSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: 'Verifique os campos assinalados.' };
  const d = parsed.data;
  const ds = await getDb();
  await ds.getRepository('ContactMessage').save({ name: d.name, email: d.email, phone: d.phone || null, subject: d.subject || null, message: d.message });
  await notifyTeam(`Nova mensagem: ${d.subject || d.name}`, [['Nome', d.name], ['Email', d.email], ['Telefone', d.phone], ['Assunto', d.subject], ['Mensagem', d.message]], d.email);
  revalidatePath('/admin/mensagens');
  return { ok: true };
}

const proposalSchema = z.object({
  company: text(2, 200, 'Indique o nome da empresa.'),
  name: text(2, 160, 'Indique o seu nome.'),
  role: optionalText(160),
  email: z.string().trim().email('Indique um email válido.').max(200),
  phone: text(6, 40, 'Indique um telefone.'),
  topic: text(2, 200, 'Indique o tema ou o curso.'),
  participants: z.coerce.number({ message: 'Indique um número.' }).int('Indique um número inteiro.').min(1, 'Pelo menos 1 pessoa.').max(1000, 'Máximo 1000.'),
  format: z.enum(['presencial-empresa', 'presencial-academia', 'online', 'indiferente'], { message: 'Escolha uma opção.' }),
  timeframe: optionalText(120),
  message: optionalText(4000),
});

const FORMAT_LABEL: Record<string, string> = {
  'presencial-empresa': 'Presencial, nas instalações da empresa',
  'presencial-academia': 'Presencial, num espaço da academia',
  online: 'Online',
  indiferente: 'Indiferente',
};

export async function requestProposal(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get('website')) return { ok: true };
  if (await tooMany('proposal')) return { ok: false, message: 'Demasiados envios. Tente novamente daqui a alguns minutos.' };
  const parsed = proposalSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: 'Verifique os campos assinalados.' };
  const d = parsed.data;
  const rows: [string, unknown][] = [
    ['Empresa', d.company],
    ['Contacto', [d.name, d.role].filter(Boolean).join(' — ')],
    ['Email', d.email],
    ['Telefone', d.phone],
    ['Tema / curso', d.topic],
    ['Participantes', d.participants],
    ['Formato', FORMAT_LABEL[d.format]],
    ['Prazo', d.timeframe],
    ['Notas', d.message],
  ];
  const ds = await getDb();
  await ds.getRepository('ContactMessage').save({
    name: d.name,
    email: d.email,
    phone: d.phone,
    subject: `Pedido de proposta — ${d.company}`,
    message: rows
      .filter(([k, v]) => v && k !== 'Email' && k !== 'Telefone')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
  });
  await notifyTeam(`Pedido de proposta — ${d.company}`, rows, d.email);
  revalidatePath('/admin/mensagens');
  return { ok: true };
}
