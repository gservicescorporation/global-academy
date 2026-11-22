import Counter from '../motion/Counter';
import ScrubText from '../motion/ScrubText';
import type { Highlight } from '@/lib/entities';

/** "500+" → { value: 500, suffix: "+" }; texto sem número → null (mostrado como está). */
function parseStat(raw: string) {
  const m = /^([^\d]*)([\d.\s]+)(.*)$/.exec(raw.trim());
  if (!m) return null;
  const value = Number(m[2].replace(/[\s.]/g, ''));
  return Number.isFinite(value) ? { prefix: m[1], value, suffix: m[3] } : null;
}

export function Manifesto({ text, stats }: { text?: string; stats: Highlight[] }) {
  if (!text && stats.length === 0) return null;
  return (
    <section className="section-y relative overflow-hidden bg-background">
      <div className="container-x relative">
        {text && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <span data-reveal="fade" className="eyebrow">
                A academia
              </span>
            </div>
            <ScrubText className="text-[clamp(1.55rem,3.2vw,2.9rem)] leading-[1.18] font-semibold tracking-tight text-ink lg:col-span-9" dim={0.18}>
              {text}
            </ScrubText>
          </div>
        )}
        {stats.length > 0 && (
          <dl className={`grid gap-4 sm:grid-cols-2 ${text ? 'mt-16 sm:mt-20' : ''} ${stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : ''}`}>
            {stats.map((s, i) => {
              const n = parseStat(s.value);
              const featured = i === 0;
              return (
                <div
                  key={s.id}
                  data-reveal="scale"
                  data-reveal-delay={i * 0.06}
                  className={`relative flex min-h-44 flex-col justify-between overflow-hidden rounded-[1.75rem] p-7 sm:p-8 ${
                    featured ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-line'
                  }`}
                >
                  {featured && <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-brand-400/50 blur-2xl" />}
                  <dt className={`relative order-2 text-sm ${featured ? 'text-white' : 'text-tertiary'}`}>{s.label}</dt>
                  <dd className={`relative order-1 font-head font-semibold tracking-tight ${n ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'} ${featured ? '' : 'text-brand-700'}`}>
                    {n ? <Counter value={n.value} prefix={n.prefix} suffix={n.suffix} /> : s.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </section>
  );
}
