import { ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PaymentPoller } from '@/components/courses/PaymentPoller';
import SplitReveal from '@/components/motion/SplitReveal';
import { getDb } from '@/lib/db';
import type { Enrollment } from '@/lib/entities';
import { syncEnrollmentPayment } from '@/lib/payments/sync';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'A sua inscrição', robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS = {
  pending: { label: 'A aguardar pagamento', Icon: Clock, cls: 'bg-gold-soft text-ink' },
  paid: { label: 'Pagamento recebido', Icon: CheckCircle2, cls: 'bg-accent text-ink' },
  cancelled: { label: 'Cancelada', Icon: XCircle, cls: 'bg-red-100 text-red-800' },
} as const;

export default async function EnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const ds = await getDb();
  const e = (await ds.getRepository('Enrollment').findOne({ where: { id }, relations: { paymentMethod: true } })) as Enrollment | null;
  if (!e) notFound();
  // Confirma no gateway enquanto está pendente (não depende só do webhook).
  try {
    e.status = await syncEnrollmentPayment(e, { revalidate: false });
  } catch (err) {
    console.error('[appypay] falha ao consultar estado', err);
  }
  const st = STATUS[e.status];
  const pd = e.paymentDetails;
  const pending = e.status === 'pending';

  return (
    <main className="relative overflow-clip bg-ink pt-36 pb-24 text-white sm:pt-44">
      {pending && pd && <PaymentPoller />}
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-1/3 right-[-15%] h-[60vmax] w-[60vmax] rounded-full bg-royal/30 blur-[130px]" />

      <div className="container-x relative max-w-4xl">
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${st.cls}`} role="status" aria-live="polite">
          <st.Icon className="h-4 w-4" aria-hidden /> {st.label}
        </span>
        <SplitReveal as="h1" immediate className="display-lg mt-6 text-balance">
          {e.status === 'paid' ? (
            <>
              Inscrição <span className="serif-accent text-white/60">confirmada.</span>
            </>
          ) : e.status === 'cancelled' ? (
            <>
              Inscrição <span className="serif-accent text-white/60">cancelada.</span>
            </>
          ) : (
            <>
              Inscrição <span className="serif-accent text-white/60">registada.</span>
            </>
          )}
        </SplitReveal>
        <p className="mt-5 max-w-2xl text-lg text-white/70">
          {e.status === 'paid'
            ? 'Recebemos o pagamento. O seu lugar está garantido. Enviamos os detalhes práticos por email antes do início.'
            : e.status === 'cancelled'
              ? 'Esta inscrição foi cancelada. Se foi engano, contacte-nos.'
              : `Guarde a referência ${e.reference}. A vaga fica confirmada quando o pagamento for recebido.`}
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <dl className="grid content-start gap-5 rounded-[2rem] bg-paper p-7 text-ink sm:p-9 lg:col-span-3">
            {[
              ['Referência', e.reference],
              ['Curso', e.courseTitle],
              ['Turma', e.sessionLabel],
              ['Participante', `${e.fullName}${e.company ? ` · ${e.company}` : ''}`],
              ['Participantes', String(e.participants)],
              ['Pagamento', e.paymentMethodName],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-line pb-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-sm text-tertiary">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
            <div className="flex items-end justify-between gap-4">
              <dt className="font-semibold">Total</dt>
              <dd className="text-3xl font-bold tracking-tight">{formatPrice(e.amount, e.currency)}</dd>
            </div>
          </dl>

          <div className="grid content-start gap-4 lg:col-span-2">
            {pending && pd?.referenceNumber && (
              <div className="rounded-[2rem] bg-white/5 p-7 ring-1 ring-white/10">
                <Image src="/images/payments/referencia.png" alt="Multicaixa" width={85} height={55} className="h-10 w-auto" />
                <h2 className="mt-5 text-xl font-semibold">Pagamento por referência</h2>
                <p className="mt-1 text-sm text-white/60">No ATM, no Multicaixa Express ou no homebanking, escolha “Pagamentos por referência”.</p>
                <dl className="mt-6 grid gap-4">
                  {[
                    ['Entidade', pd.entity ?? '—'],
                    ['Referência', pd.referenceNumber],
                    ['Montante', formatPrice(e.amount, e.currency)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs tracking-widest text-white/60 uppercase">{k}</dt>
                      <dd className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight tabular-nums">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                {pd.dueDate && <p className="mt-5 text-sm text-white/60">Válida até {new Date(pd.dueDate).toLocaleDateString('pt-PT')}.</p>}
              </div>
            )}

            {pending && pd && !pd.referenceNumber && (
              <div className="rounded-[2rem] bg-white/5 p-7 ring-1 ring-white/10">
                <Image src="/images/payments/express.png" alt="Multicaixa Express" width={84} height={55} className="h-10 w-auto" />
                <h2 className="mt-5 text-xl font-semibold">Aprove no Multicaixa Express</h2>
                <p className="mt-2 text-white/70">
                  Enviámos o pedido de pagamento para o número {e.phone}. Abra a aplicação Multicaixa Express e aprove. Esta página atualiza-se sozinha.
                </p>
              </div>
            )}

            {pending && !pd && e.paymentMethod && (
              <div className="rounded-[2rem] bg-white/5 p-7 ring-1 ring-white/10">
                <h2 className="text-xl font-semibold">Como pagar</h2>
                {e.paymentMethod.instructions && <p className="mt-3 whitespace-pre-line text-white/70">{e.paymentMethod.instructions}</p>}
                {e.paymentMethod.details && (
                  <pre className="mt-4 rounded-2xl bg-white/10 p-4 font-sans text-[15px] font-medium whitespace-pre-wrap">{e.paymentMethod.details}</pre>
                )}
                <p className="mt-4 text-sm text-white/60">
                  Indique a referência <b className="text-white">{e.reference}</b> no pagamento.
                </p>
              </div>
            )}

            <Link href="/cursos" className="btn btn-light">
              Ver outros cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={`/contacto?assunto=${encodeURIComponent(`Inscrição ${e.reference}`)}`} className="btn btn-outline-light">
              Falar connosco
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
