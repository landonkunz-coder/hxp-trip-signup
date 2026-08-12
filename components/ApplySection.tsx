import type { Trip } from "@/data/trip";
import { modeCopy } from "@/lib/tripMode";
import { SignupForm } from "@/components/SignupForm";
import { ClockIcon, UsersIcon, CheckIcon } from "@/components/Icons";

export function ApplySection({ trip }: { trip: Trip }) {
  const copy = modeCopy(trip.mode, trip.spotsRemaining);

  const steps = [
    "Send your application — two minutes, no commitment.",
    "A real person on our team reviews it within two business days.",
    "We set up a quick call and, if it's a fit, secure your spot with a deposit.",
  ];

  return (
    <section id="apply" className="scroll-mt-8 bg-gradient-to-b from-cream to-sand/60">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Persuasion column */}
          <div className="lg:pt-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brick">
              <span className="h-px w-5 bg-brick/60" />
              {copy.formEyebrow}
            </span>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {copy.formTitle}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-ink/70">{copy.formBlurb}</p>

            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-card bg-brick text-sm font-bold text-white shadow-[0_3px_7px_rgba(150,50,40,0.3)]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink/70">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
              <span className="inline-flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-brick" /> ~2 min to apply
              </span>
              <span className="inline-flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-brick" /> Capped at {trip.capacity} Builders
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-brick" /> No payment today
              </span>
            </div>
          </div>

          {/* Form card — field-note frame */}
          <div className="relative">
            <span
              className="absolute -top-3 left-1/2 z-10 h-6 w-28 -translate-x-1/2 -rotate-1 border border-[#a8783c]/30 bg-gold/60"
              aria-hidden="true"
            />
            <span className="absolute -top-5 right-5 z-10 -rotate-2 font-hand text-2xl text-brick">
              save your spot →
            </span>
            <div className="rounded-xl border-2 border-dashed border-brick/45 bg-card p-6 shadow-lift sm:p-8">
              <SignupForm trip={trip} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
