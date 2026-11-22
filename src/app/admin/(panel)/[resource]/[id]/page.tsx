import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { PageTitle } from '@/components/admin/ui';
import { loadRelationOptions } from '@/lib/admin-data';
import { resources } from '@/lib/resources';
import { getResource } from '@/server/resources';

type Props = { params: Promise<{ resource: string; id: string }> };

export default async function ResourceEdit({ params }: Props) {
  const { resource, id } = await params;
  const r = resources[resource];
  if (!r) notFound();
  const isNew = id === 'novo';

  const [record, rel] = await Promise.all([isNew ? Promise.resolve(null) : getResource(resource, id), loadRelationOptions(r.fields)]);
  if (!isNew && !record) notFound();

  return (
    <>
      <PageTitle
        title={isNew ? `Novo ${r.singular}` : `Editar ${r.singular}`}
        back={
          <Link href={`/admin/${r.key}`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-tertiary hover:text-royal">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {r.title}
          </Link>
        }
      />
      <div className="max-w-2xl rounded-3xl border border-line bg-paper p-5 sm:p-7">
        <ResourceForm resourceKey={resource} id={isNew ? null : id} fields={r.fields} record={record} relOptions={rel} singular={r.singular} listHref={`/admin/${r.key}`} />
      </div>
    </>
  );
}
