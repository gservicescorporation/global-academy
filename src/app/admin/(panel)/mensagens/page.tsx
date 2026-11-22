import { getDb } from '@/lib/db';
import type { ContactMessage } from '@/lib/entities';
import { Empty, PageTitle } from '@/components/admin/ui';
import { MessageActions } from './MessageActions';

export default async function MessagesAdmin() {
  const ds = await getDb();
  const rows = (await ds.getRepository('ContactMessage').find({ order: { createdAt: 'DESC' }, take: 200 })) as ContactMessage[];
  return (
    <>
      <PageTitle title="Mensagens" />
      {rows.length === 0 ? (
        <Empty>Sem mensagens.</Empty>
      ) : (
        <div className="grid gap-4">
          {rows.map((m) => (
            <article key={m.id} className={`rounded-3xl border bg-paper p-6 ${m.read ? 'border-line' : 'border-royal/30 ring-1 ring-royal/10'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-ink">
                    {m.name} {!m.read && <span className="ml-2 rounded-full bg-royal px-2.5 py-0.5 align-middle text-xs font-semibold text-white">Nova</span>}
                  </p>
                  <p className="text-[15px] text-tertiary">
                    <a className="hover:text-royal" href={`mailto:${m.email}`}>
                      {m.email}
                    </a>
                    {m.phone ? ` · ${m.phone}` : ''}
                  </p>
                </div>
                <p className="text-sm text-tertiary">{new Date(m.createdAt).toLocaleString('pt-PT', { timeZone: 'Africa/Luanda' })}</p>
              </div>
              {m.subject && <p className="mt-3 font-semibold text-ink">{m.subject}</p>}
              <p className="mt-2 text-[15px] whitespace-pre-line text-ink">{m.message}</p>
              <MessageActions id={m.id} read={m.read} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
