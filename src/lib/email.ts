/**
 * Envio de emails via Resend (API REST). Sem RESEND_API_KEY, não envia e regista no log:
 * nenhum formulário falha por falta de email.
 */

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: { to: string | string[]; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  if (!emailConfigured()) {
    console.info('[email] RESEND_API_KEY/EMAIL_FROM em falta — email não enviado:', msg.subject);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
        html: msg.html,
        reply_to: msg.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('[email] Resend respondeu', res.status, await res.text().catch(() => ''));
    return res.ok;
  } catch (e) {
    console.error('[email] falha ao enviar', e);
    return false;
  }
}

/** Moldura simples e legível em qualquer cliente de email. Todo o conteúdo variável já vem escapado. */
export function emailLayout(title: string, bodyHtml: string, siteName = 'Academia GSC') {
  return `<!doctype html><html lang="pt"><body style="margin:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#0e1628">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="background:#070b16;padding:24px 32px;color:#ffffff;font-size:14px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(siteName)}</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#070b16">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr></table></td></tr></table></body></html>`;
}

/** Tabela de pares rótulo/valor (valores escapados). */
export function emailRows(rows: [string, unknown][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">${rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#5b6478;width:40%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 0;font-weight:bold;white-space:pre-line">${escapeHtml(v)}</td></tr>`
    )
    .join('')}</table>`;
}
