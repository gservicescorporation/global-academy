import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { uploadDir } from '@/lib/utils';

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.exec(file); // impede path traversal
  if (!m) return new NextResponse('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(uploadDir(), file));
    return new NextResponse(new Uint8Array(buf), {
      headers: { 'content-type': MIME[m[1]], 'cache-control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
