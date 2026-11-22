import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Enrollment } from '@/lib/entities';
import { appyPayConfigured } from '@/lib/payments/appypay';
import { syncEnrollmentPayment } from '@/lib/payments/sync';

/**
 * Webhook AppyPay. O corpo só serve para identificar a inscrição (merchantTransactionId):
 * o estado é sempre confirmado junto do gateway, porque o webhook não é assinado.
 */
export async function POST(req: Request) {
  if (!appyPayConfigured()) return NextResponse.json({ error: 'Gateway não configurado' }, { status: 503 });

  let body: { merchantTransactionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const mtid = typeof body.merchantTransactionId === 'string' ? body.merchantTransactionId.trim() : '';
  if (!/^[A-Za-z0-9]{1,30}$/.test(mtid)) return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });

  const ds = await getDb();
  const enrollment = (await ds.getRepository('Enrollment').findOne({ where: { paymentRef: mtid } })) as Enrollment | null;
  if (!enrollment) return NextResponse.json({ ok: true, ignored: true });

  try {
    const status = await syncEnrollmentPayment(enrollment);
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error('[appypay] falha ao confirmar cobrança', e);
    return NextResponse.json({ error: 'Falha ao confirmar' }, { status: 502 });
  }
}
