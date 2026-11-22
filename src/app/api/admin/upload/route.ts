import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadDir } from '@/lib/utils';

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato não suportado (use JPG, PNG, WebP ou AVIF)' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Imagem acima de 8 MB' }, { status: 413 });

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/media/${name}` });
}
