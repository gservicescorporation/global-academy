import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Global Academy",
    template: "%s | Global Services Corporation",
  },
  description:
    "A Global Academy, parte da Global Services Corporation, oferece conhecimento de alto nível para impulsionar carreiras e negócios.",
  keywords: [
    "formação angola",
    "academy angola",
    "global academy angola",
    "formação corporativa",
    "centro de formação em Luanda",
    "cursos profissionais Luanda",
    "treinamento empresarial Angola",
    "capacitação corporativa",
    "certificação profissional Angola",
    "workshops empresariais",

    "global services angola",
    "global services corporation",
    "multiserviços Angola",
    "consultoria empresarial Angola",
    "soluções corporativas Luanda",
    "desenvolvimento profissional Angola",
    "assessoria estratégica Angola",

    "networking corporativo",
    "eventos empresariais Luanda",
    "fórum de negócios Angola",
    "parcerias estratégicas Angola",
    "conferências corporativas",

    "formação para setor petrolífero",
    "treinamento para bancos Angola",
    "capacitação para construtoras",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Global Academy - O Conhecimento que Transforma",
    description:
      "A Global Academy, parte da Global Services Corporation, oferece conhecimento de alto nível para impulsionar carreiras e negócios.",
    url: "https://academy.globalsc.ao",
    siteName: "Global Academy",
    type: "website",
    images: [
      {
        url: "https://academy.globalsc.ao/seo.jpg",
        width: 1200,
        height: 630,
        alt: "Global Academy - O Conhecimento que Transforma",
      },
    ],
    locale: "pt_AO",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://academy.globalsc.ao",
    title: "Global Academy - Conhecimento que Transforma",
    description:
      "A Global Academy, parte da Global Services Corporation, oferece conhecimento de alto nível para impulsionar carreiras e negócios.",
    images: ["https://academy.globalsc.ao/seo.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://academy.globalsc.ao",
    languages: {
      "pt-AO": "https://academy.globalsc.ao",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
        <script
          defer
          src="https://static.getbutton.io/widget/bundle.js?id=mTwUE"></script>
        {/* Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16634298799"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-16634298799');
        `}
        </Script>
      </body>
    </html>
  );
}
