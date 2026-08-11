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
    <section id="apply" className="scroll-mt-8 bg-gradient-to-b from-paper to-sand">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Persuasion column */}
          <div className="lg:pt-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brick">
              <span className="h-px w-5 bg-brick/60" />
              {copy.formEyebrow}
            </span>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {copy.formTitle}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-ink/70">{copy.formBlurb}</p>

            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brick/12 text-sm font-semibold text-brick">
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

          {/* Form card */}
          <div className="relative rounded-3xl border border-ink/10 bg-white p-6 shadow-lift sm:p-8">
            <SignupForm trip={trip} />
          </div>
        </div>
      </div>
    </section>
  );
}
