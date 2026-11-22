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
    <section className="section-y bg-background">
      <div className="container-x">
        {text && (
          <>
            <span data-reveal="fade" className="eyebrow text-royal">
              A academia
            </span>
            <ScrubText className="mt-8 max-w-5xl text-[clamp(1.6rem,3.6vw,3.25rem)] leading-[1.15] font-semibold tracking-tight text-ink">
              {text}
            </ScrubText>
          </>
        )}
        {stats.length > 0 && (
          <dl
            className={`grid gap-px overflow-hidden rounded-[1.75rem] bg-line ring-1 ring-line sm:grid-cols-2 ${text ? 'mt-20' : ''} ${
              stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : ''
            }`}
          >
            {stats.map((s, i) => {
              const n = parseStat(s.value);
              return (
                <div key={s.id} data-reveal="up" data-reveal-delay={i * 0.05} className="flex flex-col gap-2 bg-paper p-8 sm:p-10">
                  <dt className="order-2 text-sm text-tertiary">{s.label}</dt>
                  <dd className={`order-1 font-bold tracking-tighter text-ink ${n ? 'text-5xl sm:text-6xl' : 'text-4xl break-words sm:text-[2.75rem]'}`}>
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
