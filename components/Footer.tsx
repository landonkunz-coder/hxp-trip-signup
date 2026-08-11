import type { Trip } from "@/data/trip";
import { formatDateRange } from "@/data/trip";
import { ShieldIcon } from "@/components/Icons";

export function Footer({ trip }: { trip: Trip }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="topo absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-2xl font-semibold tracking-tight">
              HXP<span className="text-sand">.</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/65">
              Humanitarian expeditions that leave something real behind. {trip.destination},{" "}
              {formatDateRange(trip.startDate, trip.endDate)}.
            </p>
          </div>
          <div className="text-sm text-paper/70">
            <a
              href="#apply"
              className="inline-flex items-center rounded-full border border-paper/25 px-5 py-2.5 font-medium transition hover:border-paper/50 hover:bg-paper/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand"
            >
              Apply to join
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-paper/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} HXP Expeditions. Built for real Builders.</p>
          <p className="inline-flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-brick" />
            Your data is validated, sanitized, and never sold.
          </p>
        </div>
      </div>
    </footer>
  );
}
