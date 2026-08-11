import type { Trip } from "@/data/trip";
import { SectionHeading } from "@/components/SectionHeading";
import { ShieldIcon, UsersIcon, CheckIcon, PinIcon } from "@/components/Icons";

const ICONS = [CheckIcon, UsersIcon, PinIcon, ShieldIcon];

export function Highlights({ trip }: { trip: Trip }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Why HXP"
        title="A trip that means something — for them and for you"
        intro="We've run humanitarian expeditions for years. Here's what makes a Builder trip different from voluntourism."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {trip.highlights.map((h, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={h.title}
              className="group rounded-2xl border border-ink/8 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brick/10 text-brick transition-colors group-hover:bg-brick group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{h.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
