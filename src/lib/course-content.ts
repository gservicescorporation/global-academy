/**
 * Conteúdo flexível de um curso (coluna jsonb `content`). Os campos de filtro (área, preço,
 * modalidade, nível, estado) continuam em colunas próprias.
 */
export interface CourseModule {
  title: string;
  topics: string[];
}

export interface CourseFaq {
  q: string;
  a: string;
}

export interface CourseContent {
  objectives: string[];
  audience: string[];
  modules: CourseModule[];
  faq: CourseFaq[];
  gallery: string[];
}

const splitLines = (v?: string | null) =>
  (v ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/** Converte o programa antigo (uma linha por tópico, "#" = título de módulo). */
export function legacyModules(program?: string | null): CourseModule[] {
  const rows = splitLines(program);
  const hasHeadings = rows.some((l) => l.startsWith('#'));
  const out: CourseModule[] = [];
  for (const l of rows) {
    if (l.startsWith('#')) out.push({ title: l.replace(/^#+\s*/, ''), topics: [] });
    else if (hasHeadings && out.length) out[out.length - 1].topics.push(l);
    else out.push({ title: l, topics: [] });
  }
  return out;
}

/** Converte as perguntas antigas (blocos separados por linha em branco; 1.ª linha = pergunta). */
export function legacyFaq(value?: string | null): CourseFaq[] {
  return (value ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => splitLines(block))
    .filter((l) => l.length >= 2)
    .map(([q, ...a]) => ({ q, a: a.join('\n') }));
}

type LegacyCourse = {
  content?: Partial<CourseContent> | null;
  objectives?: string | null;
  audience?: string | null;
  program?: string | null;
  faq?: string | null;
  gallery?: string | null;
};

const clean = (list: unknown): string[] => (Array.isArray(list) ? list.map((x) => String(x ?? '').trim()).filter(Boolean) : []);

/** Conteúdo do curso: o jsonb quando existe, senão os campos de texto antigos. */
export function courseContent(c: LegacyCourse): CourseContent {
  const j = c.content ?? null;
  return {
    objectives: j?.objectives ? clean(j.objectives) : splitLines(c.objectives),
    audience: j?.audience ? clean(j.audience) : splitLines(c.audience),
    modules: j?.modules
      ? j.modules.map((m) => ({ title: String(m?.title ?? '').trim(), topics: clean(m?.topics) })).filter((m) => m.title)
      : legacyModules(c.program),
    faq: j?.faq ? j.faq.map((f) => ({ q: String(f?.q ?? '').trim(), a: String(f?.a ?? '').trim() })).filter((f) => f.q && f.a) : legacyFaq(c.faq),
    gallery: j?.gallery ? clean(j.gallery) : splitLines(c.gallery),
  };
}

export const emptyContent = (): CourseContent => ({ objectives: [], audience: [], modules: [], faq: [], gallery: [] });
