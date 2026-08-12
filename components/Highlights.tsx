import type { Trip } from "@/data/trip";
import { SectionHeading } from "@/components/SectionHeading";

export function Highlights({ trip }: { trip: Trip }) {
  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Why build with HXP"
        title="You bring the willingness. We bring everything else."
        intro="We've run humanitarian expeditions for years. Here's what makes a Builder trip different from voluntourism."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {trip.highlights.map((h, i) => (
          <div
            key={h.title}
            className={`group relative rounded-lg border border-sand bg-card p-6 pt-8 shadow-card transition duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-lift ${
              i % 2 ? "rotate-[1.1deg]" : "-rotate-[1.1deg]"
            }`}
          >
            <span className="absolute -top-4 left-6 flex h-11 w-11 items-center justify-center rounded-full border-2 border-card bg-brick font-display text-lg font-bold text-white shadow-[0_4px_9px_rgba(150,50,40,0.35)]">
              {i + 1}
            </span>
            <h3 className="isolate mt-2 inline-block font-display text-lg font-bold text-ink">
              <span className="hl">{h.title}</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{h.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
