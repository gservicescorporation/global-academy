import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false } };

/** 404 autónoma (sem depender da base de dados), no estilo do site. */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden bg-background py-24">
      <div aria-hidden className="dots dots-fade pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-brand-200/70 blur-3xl" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Erro 404</span>
          <h1 className="display-xl mt-6 max-w-3xl text-balance text-ink">
            Esta página <span className="hl">não existe.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-tertiary">O endereço pode estar errado, ou o curso foi retirado. Veja os cursos disponíveis ou volte ao início.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cursos" className="btn btn-dark">
              Ver cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/" className="btn btn-light">
              Página inicial
            </Link>
          </div>
        </div>
        <p aria-hidden className="text-outline font-head text-[clamp(8rem,26vw,22rem)] leading-none font-bold tracking-tighter select-none">
          404
        </p>
      </div>
    </main>
  );
}
