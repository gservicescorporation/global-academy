import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getSession } from '@/lib/auth';

const f = createUploadthing();

/** Só administradores autenticados podem carregar ficheiros. */
async function adminOnly() {
  const session = await getSession();
  if (!session) throw new UploadThingError('Não autorizado');
  return { userId: session.uid };
}

export const uploadRouter = {
  /** Imagens: capas de cursos, galerias, fotografias, logótipos, destaques. */
  image: f({ image: { maxFileSize: '16MB', maxFileCount: 30 } })
    .middleware(adminOnly)
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl })),

  /** Imagens e vídeos curtos (destaques do topo). */
  media: f({ image: { maxFileSize: '16MB', maxFileCount: 30 }, video: { maxFileSize: '256MB', maxFileCount: 3 } })
    .middleware(adminOnly)
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
