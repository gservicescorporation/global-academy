import { Plus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Empty, PageTitle } from '@/components/admin/ui';
import { loadRelationOptions } from '@/lib/admin-data';
import { resources } from '@/lib/resources';
import { formatPrice } from '@/lib/utils';
import { listResource } from '@/server/resources';
import { ReorderableRows } from './ReorderableRows';

type Props = { params: Promise<{ resource: string }> };

export default async function ResourceList({ params }: Props) {
  const { resource } = await params;
  const r = resources[resource];
  if (!r) notFound();

  const [rows, rel] = await Promise.all([listResource(resource), loadRelationOptions(r.fields)]);
  const cols = r.listColumns.map((c) => r.fields.find((f) => f.name === c)!).filter(Boolean);
  const reorderable = r.fields.some((f) => f.name === 'position');

  const cellText = (f: (typeof cols)[number], row: Record<string, unknown>) => {
    const v = row[f.name];
    if (f.type === 'relation') return rel[f.name]?.find((o) => o.value === v)?.label ?? '—';
    if (f.name === 'price') return formatPrice(Number(v) || 0, String(row.currency ?? 'AOA'));
    if (f.type === 'select') return f.options?.find((o) => o.value === v)?.label ?? String(v ?? '');
    const s = String(v ?? '');
    return s.length > 70 ? s.slice(0, 70) + '…' : s;
  };

  const tableRows = (rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    cells: (
      <>
        {cols.map((c) =>
          c.type === 'image' ? (
            <td key={c.name} className="px-5 py-3.5">
              {row[c.name] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(row[c.name])} alt="" className="h-12 w-16 rounded-lg object-cover" />
              ) : (
                <span className="text-line">—</span>
              )}
            </td>
          ) : (
            <td key={c.name} className="px-5 py-3.5 text-[15px]">
              {c.type === 'boolean' ? <span className={row[c.name] ? 'font-semibold text-green-700' : 'text-tertiary'}>{row[c.name] ? 'Sim' : 'Não'}</span> : cellText(c, row)}
            </td>
          )
        )}
        <td className="px-5 py-3.5 text-right">
          <Link href={`/admin/${r.key}/${row.id}`} className="font-semibold text-royal hover:underline">
            Editar
          </Link>
        </td>
      </>
    ),
  }));

  return (
    <>
      <PageTitle
        title={r.title}
        text={reorderable ? 'Arraste para reordenar.' : undefined}
        action={
          <Link href={`/admin/${r.key}/novo`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-royal">
            <Plus className="h-4 w-4" aria-hidden /> Adicionar {r.singular}
          </Link>
        }
      />

      {rows.length === 0 ? (
        <Empty>Ainda não há registos.</Empty>
      ) : (
        <ReorderableRows
          resourceKey={resource}
          rows={tableRows}
          reorderable={reorderable}
          head={cols.map((c) => (
            <th key={c.name} className="px-5 py-4 font-semibold">
              {c.label}
            </th>
          ))}
        />
      )}
    </>
  );
}
