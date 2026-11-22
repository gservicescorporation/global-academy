import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/admin/ui';
import { blankCourse, getCourseForm } from '@/server/courses';
import { getTrainers } from '@/lib/queries';
import { CourseEditor } from './CourseEditor';

export default async function CourseEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'novo';

  const [form, trainers] = await Promise.all([isNew ? Promise.resolve(blankCourse()) : getCourseForm(id), getTrainers()]);
  if (!form) notFound();

  return (
    <>
      <PageTitle
        title={isNew ? 'Novo curso' : form.title || 'Editar curso'}
        back={
          <Link href="/admin/cursos" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-tertiary hover:text-royal">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Cursos
          </Link>
        }
      />
      <CourseEditor initial={form} trainers={trainers.map((t) => ({ value: t.id, label: t.name }))} />
    </>
  );
}
