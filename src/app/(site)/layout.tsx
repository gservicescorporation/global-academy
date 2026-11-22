import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SmoothScroll from '@/components/motion/SmoothScroll';
import { JsonLd } from '@/components/site/JsonLd';
import { getSettings } from '@/lib/queries';
import { absoluteUrl } from '@/lib/utils';

// ISR: as páginas públicas são regeneradas a cada 5 min e imediatamente quando se guarda no painel.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: s.site_name,
          url: absoluteUrl('/'),
          logo: s.logo_url ? absoluteUrl(s.logo_url) : undefined,
          description: s.site_tagline,
          parentOrganization: s.parent_company ? { '@type': 'Organization', name: s.parent_company } : undefined,
          address: s.contact_address ? { '@type': 'PostalAddress', streetAddress: s.contact_address, addressCountry: 'AO' } : undefined,
          email: s.contact_email || undefined,
          telephone: s.contact_phone || undefined,
        }}
      />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Saltar para o conteúdo
      </a>
      <SmoothScroll>
        <Navbar siteName={s.site_name} logoUrl={s.logo_url} />
        <div id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer s={s} />
      </SmoothScroll>
    </>
  );
}
