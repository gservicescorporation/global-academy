import { revalidatePath } from 'next/cache';
import { getDb } from '../db';
import { emailLayout, emailRows, escapeHtml, sendEmail } from '../email';
import type { Enrollment } from '../entities';
import { getSettings } from '../queries';
import { absoluteUrl, formatPrice } from '../utils';
import { appyPayConfigured, getAppyPayChargeStatus } from './appypay';

/**
 * Confirma no AppyPay o estado de uma inscrição pendente e aplica-o.
 * A transição é atómica (só muda se ainda estiver "pending"), por isso o webhook e a página
 * podem chamá-la em simultâneo sem enviar o email de confirmação duas vezes.
 */
export async function syncEnrollmentPayment(e: Enrollment, opts: { revalidate?: boolean } = { revalidate: true }): Promise<Enrollment['status']> {
  if (e.status !== 'pending' || !e.paymentDetails?.chargeId || !appyPayConfigured()) return e.status;

  const status = await getAppyPayChargeStatus(e.paymentDetails.chargeId);
  if (status === 'pending') return 'pending';

  const ds = await getDb();
  const changed = (await ds.query(`UPDATE enrollments SET status = $1 WHERE id = $2 AND status = 'pending' RETURNING id`, [status, e.id])) as unknown[];
  // O driver pg devolve [linhas, contagem] em UPDATE … RETURNING.
  const rows = Array.isArray(changed[0]) ? (changed[0] as unknown[]) : changed;
  if (rows.length === 0) return status;

  // revalidatePath não pode correr durante a renderização de uma página.
  if (opts.revalidate) revalidatePath('/', 'layout');
  if (status === 'paid') await sendPaidEmail(e);
  return status;
}

export async function sendPaidEmail(e: Enrollment) {
  const s = await getSettings();
  await sendEmail({
    to: e.email,
    replyTo: s.contact_email || undefined,
    subject: `Pagamento confirmado — ${e.courseTitle}`,
    html: emailLayout(
      'Pagamento confirmado',
      `<p style="font-size:15px;line-height:1.6">Olá ${escapeHtml(e.fullName.split(' ')[0])}, recebemos o pagamento. O seu lugar está garantido.</p>
${emailRows([
  ['Referência', e.reference],
  ['Curso', e.courseTitle],
  ['Turma', e.sessionLabel],
  ['Participantes', e.participants],
  ['Total pago', formatPrice(e.amount, e.currency)],
])}
<p style="font-size:15px;line-height:1.6;margin-top:24px">Antes do início enviamos os detalhes práticos (local, horário e material).</p>
<p style="margin-top:24px"><a href="${escapeHtml(absoluteUrl(`/inscricao/${e.id}`))}" style="display:inline-block;background:#070b16;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold">Ver a inscrição</a></p>`,
      s.site_name
    ),
  });
  if (s.contact_email) {
    await sendEmail({
      to: s.contact_email,
      subject: `Pago: ${e.reference} — ${e.courseTitle}`,
      html: emailLayout('Pagamento recebido', emailRows([['Referência', e.reference], ['Nome', e.fullName], ['Total', formatPrice(e.amount, e.currency)]]), s.site_name),
    });
  }
}
