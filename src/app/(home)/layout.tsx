
import type { Metadata } from "next";
import Footer from "../ui/Footer";
import Header from "../ui/Header";

export const metadata: Metadata = {
  title: "Global Academy | Página Inicial",
  description: "Descrição da página para mecanismos de busca.",
  openGraph: {
    title: "Global Academy | Página Inicial",
    description: `Global Academy – O Conhecimento que Transforma.
Cursos de excelência para profissionais de alto nível.`,
    url: "https://academy.globalsc.ao",
    siteName: "Global Academy",
    images: [
      {
        url: "https://global-services-corporation.github.io/images/academy/gestao-sinistros/2.jpeg",
        width: 1200,
        height: 630,
        alt: "O Conhecimento que Transforma",
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nome do Site | Título da Página",
    description: "Descrição da página para Twitter.",
    images: ["https://global-services-corporation.github.io/images/academy/gestao-sinistros/2.jpeg"],
  },
};

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
