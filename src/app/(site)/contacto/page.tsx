import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/forms/ContactForm';
import { PageHero } from '@/components/site/PageHero';
import { getSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Contactos',
  description: 'Contactos da academia: telefone, email, morada e horário. Tire dúvidas sobre cursos, datas e inscrições.',
  alternates: { canonical: '/contacto' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ assunto?: string }> }) {
  const [s, q] = await Promise.all([getSettings(), searchParams]);
  const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`;
  const items = [
    s.contact_phone && { icon: Phone, label: 'Telefone', value: s.contact_phone, href: tel(s.contact_phone) },
    s.contact_phone_2 && { icon: Phone, label: 'Telefone fixo', value: s.contact_phone_2, href: tel(s.contact_phone_2) },
    s.contact_email && { icon: Mail, label: 'Email', value: s.contact_email, href: `mailto:${s.contact_email}` },
    s.contact_address && { icon: MapPin, label: 'Morada', value: s.contact_address },
    s.contact_hours && { icon: Clock, label: 'Horário', value: s.contact_hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];
  const subject = typeof q.assunto === 'string' ? q.assunto.slice(0, 200) : undefined;

  return (
    <main>
      <PageHero
        eyebrow="Contactos"
        title={
          <>
            Fale com <span className="serif-accent text-white/60">a academia.</span>
          </>
        }
        text={s.contact_intro}
      />

      <section className="section-y bg-background">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <ul className="grid min-w-0 content-start gap-3 lg:col-span-5">
            {items.map((i, n) => {
              const Icon = i.icon;
              const inner = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-tertiary">{i.label}</span>
                    <span className="block font-semibold whitespace-pre-line text-ink [overflow-wrap:anywhere]">{i.value}</span>
                  </span>
                  {i.href && <ArrowUpRight className="h-5 w-5 shrink-0 text-tertiary transition-transform duration-500 group-hover:rotate-45 group-hover:text-royal" aria-hidden />}
                </>
              );
              const cls = 'group flex items-center gap-4 rounded-[1.5rem] bg-paper p-5 ring-1 ring-line';
              return (
                <li key={i.label} data-reveal="up" data-reveal-delay={n * 0.05}>
                  {i.href ? (
                    <a href={i.href} className={`${cls} transition-colors hover:ring-ink/25`}>
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </li>
              );
            })}
            {s.contact_whatsapp && /^\d{9,15}$/.test(s.contact_whatsapp) && (
              <li data-reveal="up">
                <a href={`https://wa.me/${s.contact_whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-2 w-full">
                  <MessageCircle className="h-4 w-4" aria-hidden /> Conversar no WhatsApp
                </a>
              </li>
            )}
          </ul>

          <div data-reveal="up" className="min-w-0 rounded-[2rem] bg-paper p-6 ring-1 ring-line sm:p-10 lg:col-span-7">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Envie-nos uma mensagem</h2>
            <p className="mt-2 mb-8 text-tertiary">Para pedidos de formação para a sua equipa, use o <Link href="/empresas#proposta" className="font-semibold text-royal underline-offset-4 hover:underline">pedido de proposta</Link>.</p>
            <ContactForm defaultSubject={subject} />
          </div>
        </div>
      </section>
    </main>
  );
}
