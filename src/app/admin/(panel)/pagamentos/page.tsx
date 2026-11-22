import { Badge, Empty, PageTitle } from '@/components/admin/ui';
import { ENROLLMENT_STATUS, listPayments } from '@/server/enrollments';
import { formatPrice } from '@/lib/utils';
import { appyPayConfigured } from '@/lib/payments/appypay';

export default async function PaymentsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = '' } = await searchParams;
  const rows = await listPayments(status);
  const tabs = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'paid', label: 'Pagos' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <>
      <PageTitle
        title="Pagamentos"
        text={appyPayConfigured() ? 'Integração AppyPay ativa (Multicaixa Express e referência).' : 'AppyPay não está configurado — as inscrições usam instruções manuais.'}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <a
            key={t.value}
            href={t.value ? `?status=${t.value}` : '?'}
            className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-semibold transition ${
              status === t.value ? 'bg-ink text-white' : 'bg-paper text-tertiary ring-1 ring-line hover:text-ink'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty>Nenhum pagamento encontrado.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-tertiary">
              <tr>
                <th className="px-5 py-4 font-semibold">Referência</th>
                <th className="px-5 py-4 font-semibold">Curso</th>
                <th className="px-5 py-4 font-semibold">Método</th>
                <th className="px-5 py-4 font-semibold">Valor</th>
                <th className="px-5 py-4 font-semibold">Gateway</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 font-semibold">{e.reference}</td>
                  <td className="px-5 py-3.5 text-tertiary">{e.courseTitle}</td>
                  <td className="px-5 py-3.5">{e.paymentMethodName}</td>
                  <td className="px-5 py-3.5">{formatPrice(e.amount, e.currency)}</td>
                  <td className="px-5 py-3.5 text-tertiary">
                    {e.paymentDetails?.referenceNumber ? `Ref. ${e.paymentDetails.referenceNumber}` : e.paymentDetails ? 'Multicaixa Express' : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={ENROLLMENT_STATUS[e.status].tone}>{ENROLLMENT_STATUS[e.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
