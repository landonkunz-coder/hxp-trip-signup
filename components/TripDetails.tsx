import type { Trip } from "@/data/trip";
import { formatDateRange, formatPrice } from "@/data/trip";
import { SectionHeading } from "@/components/SectionHeading";
import { CheckIcon, CalendarIcon, PinIcon, UsersIcon, TagIcon } from "@/components/Icons";

export function TripDetails({ trip }: { trip: Trip }) {
  const facts = [
    { icon: CalendarIcon, label: "Dates", value: formatDateRange(trip.startDate, trip.endDate) },
    { icon: PinIcon, label: "Destination", value: trip.destination },
    { icon: UsersIcon, label: "Group size", value: `Capped at ${trip.capacity} Builders` },
    { icon: TagIcon, label: "Program fee", value: formatPrice(trip.priceUSD) },
  ];

  return (
    <section id="trip" className="scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow="The expedition"
          title="What twelve days on the island looks like"
          intro={trip.summary}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Included / not included */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-sand bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-bold text-ink">What's included</h3>
              <ul className="mt-4 space-y-3">
                {trip.included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink/75">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brick" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-dashed border-sand bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-bold text-ink">Not included</h3>
              <ul className="mt-4 space-y-3">
                {trip.notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink/60">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Facts card */}
          <aside className="rounded-lg border-2 border-brickdeep bg-ink p-7 text-paper shadow-card">
            <p className="font-hand text-2xl leading-none text-gold">at a glance</p>
            <dl className="mt-4 divide-y divide-paper/10">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <f.icon className="h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper/55">{f.label}</dt>
                    <dd className="text-sm font-semibold text-paper">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-paper/60">{trip.priceNote}</p>
            <a
              href="#apply"
              className="btn-chunky mt-6 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Start your application
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
