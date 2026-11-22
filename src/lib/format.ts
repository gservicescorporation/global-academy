/** Formatadores sem dependências de Node: podem ser usados no browser. */

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** "2026-11-15","2026-11-17" -> { days: "15–17", month: "Novembro", full: "15–17 Novembro" } */
export function formatRange(start: string, end: string) {
  const [, sm, sd] = start.split('-').map(Number);
  const [, em, ed] = end.split('-').map(Number);
  if (start === end) return { days: String(sd), month: MONTHS[sm - 1], full: `${sd} ${MONTHS[sm - 1]}` };
  if (sm === em) return { days: `${sd}–${ed}`, month: MONTHS[sm - 1], full: `${sd}–${ed} ${MONTHS[sm - 1]}` };
  const a = MONTHS[sm - 1].slice(0, 3), b = MONTHS[em - 1].slice(0, 3);
  return { days: `${sd}/${a}`, month: `→ ${ed}/${b}`, full: `${sd} ${a} – ${ed} ${b}` };
}

export const COURSE_STATUS = {
  soon: { label: 'Em breve', cls: 'bg-white text-brand-800' },
  open: { label: 'Inscrições abertas', cls: 'bg-brand-600 text-white' },
  done: { label: 'Edição realizada', cls: 'bg-white/90 text-tertiary' },
} as const;

export function formatPrice(n: number, currency = 'AOA') {
  if (!Number(n)) return 'Sob consulta';
  const sym = currency === 'AOA' ? 'Kz' : currency;
  return `${Number(n).toLocaleString('pt-PT', { maximumFractionDigits: 2 })} ${sym}`;
}

export function lines(value?: string | null): string[] {
  return (value ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}
