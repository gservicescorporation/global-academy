import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import { getSettings } from '@/lib/queries';
import './globals.css';

const display = Inter_Tight({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const siteName = s.site_name || 'Global Academy';
  const description = s.site_tagline || 'Formação presencial em gestão, seguros e liderança, certificada pelo INEFOP.';
  const base = process.env.SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(base),
    title: { default: `${siteName} — Formação presencial`, template: `%s · ${siteName}` },
    description,
    keywords: ['formação profissional Angola', 'cursos certificados INEFOP', 'formação executiva Luanda', siteName],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_AO',
      url: base,
      siteName,
      title: siteName,
      description,
      images: s.hero_image ? [{ url: s.hero_image, width: 1200, height: 630, alt: siteName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: s.hero_image ? [s.hero_image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f5faff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
