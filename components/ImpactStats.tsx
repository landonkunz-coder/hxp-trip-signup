import { Reveal } from "@/components/Reveal";

const STATS = [
  { value: "7,000+", hand: "every single year", label: "Builders each year" },
  { value: "610,000+", hand: "hands on tools", label: "hours served worldwide" },
  { value: "72", hand: "and counting", label: "buildings raised in 2025" },
];

export function ImpactStats() {
  return (
    <section className="relative overflow-hidden bg-brick text-white">
      <div className="topo-dark absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-white/90">
            In 2025, HXP Builders served{" "}
            <span className="font-semibold text-white">610,000+ hours</span> across the globe — and left behind
            schools, clinics, and clean water the communities chose themselves.
          </p>
        </Reveal>
        <dl className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="border-l-2 border-white/25 pl-5">
                <dt className="font-display text-5xl font-bold tracking-tight sm:text-6xl">{s.value}</dt>
                <p className="mt-1 font-hand text-2xl leading-none text-white/90">{s.hand}</p>
                <dd className="mt-2 text-sm uppercase tracking-[0.14em] text-white/75">{s.label}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
