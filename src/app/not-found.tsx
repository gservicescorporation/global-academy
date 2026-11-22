import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false } };

/** 404 autónoma (sem depender da base de dados), no estilo do site. */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink py-24 text-white">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-1/3 right-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-royal/35 blur-[130px]" />
      <svg aria-hidden viewBox="0 0 1000 400" className="pointer-events-none absolute inset-x-0 bottom-[-6%] w-full opacity-[0.07]">
        <text x="0" y="360" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="white" style={{ fontSize: 420, fontWeight: 800, letterSpacing: '-0.05em' }}>
          404
        </text>
      </svg>
      <div className="container-x relative">
        <span className="eyebrow text-accent">Erro 404</span>
        <h1 className="display-xl mt-6 max-w-4xl text-balance">
          Esta página <span className="serif-accent text-white/60">não existe.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/65">O endereço pode estar errado, ou o curso foi retirado. Veja os cursos disponíveis ou volte ao início.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cursos" className="btn btn-light">
            Ver cursos <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/" className="btn btn-outline-light">
            Página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
