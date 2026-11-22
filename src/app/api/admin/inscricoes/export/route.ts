import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { enrollmentsCsv, listEnrollments } from '@/server/enrollments';

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const { rows } = await listEnrollments(Object.fromEntries(searchParams), 5000);
  return new NextResponse(enrollmentsCsv(rows), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="inscricoes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
