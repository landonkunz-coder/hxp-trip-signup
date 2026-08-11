import type { Trip } from "@/data/trip";
import { formatDateRange, formatPrice } from "@/data/trip";
import { modeCopy } from "@/lib/tripMode";
import { CalendarIcon, PinIcon, ClockIcon, TagIcon, ArrowIcon } from "@/components/Icons";

export function Hero({ trip }: { trip: Trip }) {
  const copy = modeCopy(trip.mode, trip.spotsRemaining);
  const facts = [
    { icon: CalendarIcon, label: formatDateRange(trip.startDate, trip.endDate) },
    { icon: PinIcon, label: trip.destination },
    { icon: ClockIcon, label: trip.durationLabel },
    { icon: TagIcon, label: `${formatPrice(trip.priceUSD)} program fee` },
  ];

  return (
    <section className="relative overflow-hidden bg-brick text-white">
      {/* Warmth + depth on the terracotta wash */}
      <div className="topo absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-soft-light"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 0), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4) 1px, transparent 0)",
          backgroundSize: "120px 120px, 90px 90px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-8 sm:px-8 sm:pb-32 sm:pt-10">
        <nav className="mb-14 flex items-center justify-between sm:mb-20">
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            HXP<span className="text-white/60">.</span>
          </span>
          <a
            href="#apply"
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/60 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Apply
          </a>
        </nav>

        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 animate-fade-in">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <span className="h-px w-6 bg-white/50" />
              HXP Humanitarian Expeditions
            </span>
            {copy.badge && (
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-brick shadow-sm">
                {copy.badge}
              </span>
            )}
          </div>

          <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-up">
            Build something that lasts in {trip.country}.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl animate-fade-up">
            {trip.tagline}
          </p>

          {/* Key facts */}
          <dl className="mt-9 flex flex-wrap gap-x-6 gap-y-3 animate-fade-up">
            {facts.map((f) => (
              <div key={f.label} className="inline-flex items-center gap-2 text-sm text-white/90">
                <f.icon className="h-4 w-4 text-white" />
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-up">
            <a
              href="#apply"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brick shadow-lift transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brick"
            >
              {copy.ctaLabel}
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#trip"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-base font-medium text-white transition hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore the trip
            </a>
          </div>

          <p className="mt-8 text-sm text-white/70 animate-fade-up">
            Vetted lodging · Licensed local guides · 24/7 in-country support
          </p>
        </div>
      </div>

      {/* Wave transition into the page body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px]" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="h-[60px] w-full sm:h-[90px]">
          <path d="M0,45 C240,88 480,88 720,55 C960,22 1200,22 1440,52 L1440,90 L0,90 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
