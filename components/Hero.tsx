import type { Trip } from "@/data/trip";
import { formatDateRange, formatPrice } from "@/data/trip";
import { modeCopy } from "@/lib/tripMode";
import { ArrowIcon } from "@/components/Icons";

export function Hero({ trip }: { trip: Trip }) {
  const copy = modeCopy(trip.mode, trip.spotsRemaining);
  const heroUrl = trip.heroImage
    ? `https://images.unsplash.com/${trip.heroImage.id}?auto=format&fit=crop&w=1100&h=1200&q=72`
    : null;

  const chips = [
    <>
      <b className="font-bold text-brick">{formatDateRange(trip.startDate, trip.endDate)}</b>
    </>,
    <>
      <b className="font-bold text-brick">{trip.durationLabel}</b>
    </>,
    <>
      <b className="font-bold text-brick">{formatPrice(trip.priceUSD)}</b> program fee
    </>,
    <>
      Capped at <b className="font-bold text-brick">{trip.capacity}</b> Builders
    </>,
  ];

  return (
    <>
      {/* Header */}
      <header className="border-b-2 border-sand">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <span className="rounded-md border-2 border-ink bg-card px-3 py-0.5 font-display text-2xl font-bold tracking-wide text-brick shadow-[2px_2px_0_#3a2b1e]">
              HXP
            </span>
            <span className="text-sm font-semibold leading-tight text-ink">
              Humanitarian Expeditions
              <span className="block font-hand text-base font-normal leading-none text-brick">build with us</span>
            </span>
          </div>
          <nav className="flex items-center gap-7">
            <a href="#why" className="hidden text-sm font-semibold text-ink/70 transition hover:text-brick sm:block">
              Why HXP
            </a>
            <a href="#impact" className="hidden text-sm font-semibold text-ink/70 transition hover:text-brick sm:block">
              Impact
            </a>
            <a href="#trip" className="hidden text-sm font-semibold text-ink/70 transition hover:text-brick sm:block">
              The Trip
            </a>
            <a
              href="#apply"
              className="rounded border-2 border-brickdeep bg-brick px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_#a63a30] transition hover:translate-y-0.5"
            >
              Apply to join
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
          {/* Left column */}
          <div className="animate-fade-up">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brick">HXP Build Expedition</span>
            <div className="mt-1">
              <span className="inline-block -rotate-3 font-hand text-3xl leading-none text-brick sm:text-4xl">
                twelve days on Efate!
              </span>
            </div>
            <h1 className="isolate mt-1 font-display text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Vanuatu <span className="hl text-brick">Build</span> Expedition
            </h1>
            <div className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
              Efate Island · Vanuatu · South Pacific
            </div>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/80">{trip.tagline}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded border border-dashed border-sand bg-card px-3.5 py-2 text-sm font-semibold text-ink"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="btn-chunky group focus:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                {copy.ctaLabel}
                <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </a>
              {copy.badge && (
                <span className="inline-flex items-center gap-2 rounded-full bg-brick px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_3px_8px_rgba(150,50,40,0.3)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  {copy.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right column — polaroid photo card */}
          <figure className="relative mx-auto w-full max-w-md rotate-2 rounded-md border border-sand bg-card p-3.5 pb-4 shadow-[0_18px_34px_rgba(90,55,30,0.2)]">
            <span
              className="absolute -top-3 left-5 h-7 w-24 -rotate-6 border border-[#a8783c]/30 bg-gold/60"
              aria-hidden="true"
            />
            <span
              className="absolute -top-3 right-5 h-7 w-24 rotate-6 border border-[#a8783c]/30 bg-gold/60"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-sm bg-sand">
              <span className="absolute left-3.5 top-3.5 z-10 rounded-full border-[1.5px] border-sand bg-cream px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
                Ages 16–19
              </span>
              {copy.badge && (
                <span className="absolute bottom-3.5 right-3.5 z-10 inline-flex items-center gap-2 rounded-full bg-brick px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  {copy.badge}
                </span>
              )}
              {heroUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroUrl}
                  alt={trip.heroImage?.alt ?? trip.destination}
                  className="h-[360px] w-full object-cover sm:h-[440px]"
                  style={{ filter: "sepia(16%) saturate(1.12) contrast(1.02)" }}
                />
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-1.5 pt-3">
              <span className="font-display text-base font-bold text-ink">{trip.destination}</span>
              <span className="font-hand text-xl text-brick">see you there →</span>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
