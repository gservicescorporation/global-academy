import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';

const g = globalThis as unknown as { __gaDs?: DataSource; __gaDsP?: Promise<DataSource> };

/** Alterações de esquema aditivas e idempotentes para produção, onde DB_SYNC=false. */
async function ensureSchema(ds: DataSource) {
  if (process.env.DB_SYNC === 'true') return;
  // Nomes de colunas iguais aos que o TypeORM gera (nome da propriedade, entre aspas).
  const statements = [
    `ALTER TABLE IF EXISTS enrollments ADD COLUMN IF NOT EXISTS payment_details jsonb`,
    `ALTER TABLE IF EXISTS enrollments ADD COLUMN IF NOT EXISTS is_company boolean NOT NULL DEFAULT false`,
    `ALTER TABLE IF EXISTS enrollments ADD COLUMN IF NOT EXISTS tax_id varchar(40)`,
    `ALTER TABLE IF EXISTS courses ADD COLUMN IF NOT EXISTS "area" varchar(120)`,
    `ALTER TABLE IF EXISTS courses ADD COLUMN IF NOT EXISTS "faq" text`,
    `ALTER TABLE IF EXISTS courses ADD COLUMN IF NOT EXISTS "content" jsonb`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS "lastLoginAt" timestamptz`,
    `CREATE TABLE IF NOT EXISTS hero_slides (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "title" varchar(200) NOT NULL,
      "description" text,
      "imageUrl" varchar(500) NOT NULL,
      "link" varchar(500),
      "buttonText" varchar(80),
      "published" boolean NOT NULL DEFAULT true,
      "position" int NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "quote" text NOT NULL,
      "name" varchar(160) NOT NULL,
      "role" varchar(160),
      "company" varchar(160),
      "photoUrl" varchar(500),
      "published" boolean NOT NULL DEFAULT true,
      "position" int NOT NULL DEFAULT 0
    )`,
  ];
  for (const sql of statements) await ds.query(sql);
}

/** Liga à base de dados uma única vez (também em hot-reload). */
export async function getDb(): Promise<DataSource> {
  if (g.__gaDs?.isInitialized) return g.__gaDs;
  if (!g.__gaDsP) {
    const ds = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
      synchronize: process.env.DB_SYNC === 'true',
      logging: false,
      // Mantém o número de ligações baixo: evita esgotar o limite do pooler (ex.: Supabase Supavisor)
      // quando há vários processos/instâncias a correr em produção.
      extra: {
        max: Number(process.env.DB_POOL_MAX ?? 5),
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      },
    });
    g.__gaDsP = ds.initialize().then(async (d) => {
      await ensureSchema(d);
      g.__gaDs = d;
      return d;
    }).catch((e) => {
      g.__gaDsP = undefined;
      throw e;
    });
  }
  return g.__gaDsP;
}
