import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entrar · Painel', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-6 text-white">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-1/3 right-[-10%] h-[55vmax] w-[55vmax] rounded-full bg-royal/35 blur-[120px]" />
      <div className="relative w-full max-w-sm rounded-[2rem] bg-paper p-8 text-ink shadow-2xl sm:p-10">
        <span className="eyebrow text-royal">Academia</span>
        <h1 className="display-md mt-4 text-balance">Painel administrativo</h1>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
