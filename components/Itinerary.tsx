import type { Trip } from "@/data/trip";
import { SectionHeading } from "@/components/SectionHeading";

export function Itinerary({ trip }: { trip: Trip }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Day by day"
        title="A rough map of the journey"
        intro="Plans flex with the community's needs and the weather — but here's the shape of the trip."
      />

      <ol className="mt-12 space-y-2">
        {trip.itinerary.map((day, i) => (
          <li key={day.title} className="group relative flex gap-5 sm:gap-8">
            {/* Rail */}
            <div className="flex flex-col items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brick/30 bg-white font-display text-sm font-semibold text-brick shadow-sm">
                {i + 1}
              </div>
              {i < trip.itinerary.length - 1 && (
                <div className="my-1 w-px grow bg-gradient-to-b from-brick/40 to-brick/10" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brick">{day.label}</span>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">{day.title}</h3>
              <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-ink/65">{day.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
