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
  pending: { label: 'Inscrição recebida', Icon: Clock, cls: 'bg-amber-100 text-amber-900' },
  paid: { label: 'Vaga confirmada', Icon: CheckCircle2, cls: 'bg-brand-600 text-white' },
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
    <main className="relative overflow-clip bg-background pt-36 pb-24 sm:pt-44">
      {pending && pd && <PaymentPoller />}
      <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-56 -right-40 h-[36rem] w-[36rem] rounded-full bg-brand-200/70 blur-3xl" />

      <div className="container-x relative max-w-5xl">
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${st.cls}`} role="status" aria-live="polite">
          <st.Icon className="h-4 w-4" aria-hidden /> {st.label}
        </span>
        <SplitReveal as="h1" immediate className="display-lg mt-6 text-balance text-ink">
          {e.status === 'paid' ? (
            <>
              Inscrição <span className="hl">confirmada.</span>
            </>
          ) : e.status === 'cancelled' ? (
            <>
              Inscrição <span className="hl">cancelada.</span>
            </>
          ) : (
            <>
              Inscrição <span className="hl">registada.</span>
            </>
          )}
        </SplitReveal>
        <p className="mt-5 max-w-2xl text-lg text-tertiary">
          {e.status === 'paid'
            ? 'O seu lugar está garantido. Enviamos os detalhes práticos por email antes do início.'
            : e.status === 'cancelled'
              ? 'Esta inscrição foi cancelada. Se foi engano, contacte-nos.'
              : `Guarde a referência ${e.reference}. A nossa equipa vai contactá-lo pelo telefone ou email indicados para confirmar a vaga e combinar o pagamento.`}
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-5">
          <dl className="grid content-start gap-4 rounded-[2rem] bg-white p-7 ring-1 ring-line sm:p-9 lg:col-span-3">
            {[
              ['Referência', e.reference],
              ['Curso', e.courseTitle],
              ['Turma', e.sessionLabel],
              ['Participante', `${e.fullName}${e.company ? ` · ${e.company}` : ''}`],
              ['Participantes', String(e.participants)],
              ['Contacto', `${e.phone} · ${e.email}`],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-line pb-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-sm text-tertiary">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
            <div className="flex items-end justify-between gap-4 rounded-2xl bg-brand-50 p-4">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-head text-3xl font-semibold tracking-tight text-ink">{formatPrice(e.amount, e.currency)}</dd>
            </div>
          </dl>

          <div className="grid content-start gap-4 lg:col-span-2">
            {pending && pd?.referenceNumber && (
              <div className="on-blue rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white">
                <Image src="/images/payments/referencia.png" alt="Multicaixa" width={85} height={55} className="h-10 w-auto" />
                <h2 className="mt-5 font-head text-xl font-bold">Pagamento por referência</h2>
                <p className="mt-1 text-sm text-white">No ATM, no Multicaixa Express ou no homebanking, escolha “Pagamentos por referência”.</p>
                <dl className="mt-6 grid gap-3">
                  {[
                    ['Entidade', pd.entity ?? '—'],
                    ['Referência', pd.referenceNumber],
                    ['Montante', formatPrice(e.amount, e.currency)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-white/12 px-4 py-3">
                      <dt className="text-xs font-semibold tracking-wide text-white uppercase">{k}</dt>
                      <dd className="mt-1 font-head text-2xl font-semibold tracking-tight tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                {pd.dueDate && <p className="mt-5 text-sm text-white">Válida até {new Date(pd.dueDate).toLocaleDateString('pt-PT')}.</p>}
              </div>
            )}

            {pending && pd && !pd.referenceNumber && (
              <div className="rounded-[2rem] bg-white p-7 ring-1 ring-line">
                <Image src="/images/payments/express.png" alt="Multicaixa Express" width={84} height={55} className="h-10 w-auto" />
                <h2 className="mt-5 font-head text-xl font-bold text-ink">Aprove no Multicaixa Express</h2>
                <p className="mt-2 text-tertiary">
                  Enviámos o pedido de pagamento para o número {e.phone}. Abra a aplicação Multicaixa Express e aprove. Esta página atualiza-se sozinha.
                </p>
              </div>
            )}

            {pending && !pd && (
              <div className="on-blue rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white">
                <h2 className="font-head text-xl font-semibold">O que acontece agora</h2>
                <ol className="mt-5 grid gap-4">
                  {[
                    'Recebe por email o resumo desta inscrição.',
                    'A nossa equipa liga-lhe para confirmar a vaga e explicar como pagar.',
                    'Antes do início, enviamos o local, o horário e o que levar.',
                  ].map((t, i) => (
                    <li key={t} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">{i + 1}</span>
                      <span className="text-[15px] leading-relaxed text-white">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Link href="/cursos" className="btn btn-dark">
              Ver outros cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={`/contacto?assunto=${encodeURIComponent(`Inscrição ${e.reference}`)}`} className="btn btn-light">
              Falar connosco
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
