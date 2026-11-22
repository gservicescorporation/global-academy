import type { MetadataRoute } from 'next';
import { getCourses } from '@/lib/queries';

// Gerado por pedido: o build não depende da base de dados.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  const courses = await getCourses();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/cursos`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/calendario`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/empresas`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sobre`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${base}/cursos/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...coursePages];
}
