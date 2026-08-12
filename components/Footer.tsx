import type { Trip } from "@/data/trip";
import { formatDateRange } from "@/data/trip";
import { ShieldIcon } from "@/components/Icons";

export function Footer({ trip }: { trip: Trip }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-sand bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-9 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <span className="font-display text-xl font-bold tracking-tight text-brick">
            HXP · Humanitarian Expeditions
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
            {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-sand/60 pt-5 text-xs text-ink/55 sm:flex-row sm:items-center sm:justify-between">
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
