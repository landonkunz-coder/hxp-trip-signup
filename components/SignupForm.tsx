"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Trip } from "@/data/trip";
import { FIELD_ORDER, validateField, type SignupInput } from "@/lib/validation";
import { evaluateEligibility, guardianConsentErrors } from "@/lib/eligibility";
import { modeCopy } from "@/lib/tripMode";
import { CheckIcon, ShieldIcon, SpinnerIcon, ArrowIcon } from "@/components/Icons";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FieldName = keyof SignupInput;
type Status = "idle" | "submitting" | "success" | "ineligible";

interface FieldDef {
  name: FieldName;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  full?: boolean;
  multiline?: boolean;
  hint?: string;
  minorOnly?: boolean; // rendered only when the applicant is a minor at departure
}

const FIELDS: FieldDef[] = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name", placeholder: "Your legal name", required: true, full: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email", placeholder: "you@example.com", required: true },
  { name: "dateOfBirth", label: "Date of birth", type: "date", autoComplete: "bday", required: true, hint: "You must be 16–19 on the trip's departure date." },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+1 555 123 4567", required: true },
  { name: "emergencyName", label: "Emergency contact", type: "text", autoComplete: "off", placeholder: "Their full name", required: true, hint: "Someone we can reach while you travel." },
  { name: "emergencyPhone", label: "Emergency contact phone", type: "tel", autoComplete: "off", inputMode: "tel", placeholder: "+1 555 987 6543", required: true },
  { name: "guardianName", label: "Parent/guardian name", type: "text", autoComplete: "off", placeholder: "Their full name", required: true, minorOnly: true, full: true, hint: "Required because you'll be under 18 on the departure date." },
  { name: "guardianEmail", label: "Parent/guardian email", type: "email", autoComplete: "off", inputMode: "email", placeholder: "guardian@example.com", required: true, minorOnly: true, full: true },
  { name: "dietary", label: "Dietary restrictions", multiline: true, full: true, placeholder: "Allergies, vegetarian, none…", hint: "Optional — helps us plan meals." },
  { name: "reason", label: "Why do you want to come?", multiline: true, full: true, placeholder: "A sentence or two is plenty.", required: true },
];

const EMPTY: SignupInput = {
  fullName: "", email: "", dateOfBirth: "", phone: "", emergencyName: "", emergencyPhone: "",
  guardianName: "", guardianEmail: "", dietary: "", reason: "",
};

export function SignupForm({ trip }: { trip: Trip }) {
  const copy = modeCopy(trip.mode, trip.spotsRemaining);

  const [values, setValues] = useState<SignupInput>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [ineligibleReason, setIneligibleReason] = useState<"too_young" | "too_old" | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const refs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const handleToken = useCallback((t: string | null) => setToken(t), []);

  // Eligibility mirrors the server rule (age at the trip's DEPARTURE date). Used
  // to reveal guardian fields for minors and to give feedback before submit.
  const elig = evaluateEligibility(values.dateOfBirth, trip.startDate);
  const isMinor = elig.isMinor;
  const showIneligibleHint = elig.status === "too_young" || elig.status === "too_old";

  // Move focus to the confirmation/notice heading so screen-reader + keyboard
  // users are told the outcome (the form is replaced on success/ineligible).
  useEffect(() => {
    if (status === "success" || status === "ineligible") confirmHeadingRef.current?.focus();
  }, [status]);

  const setField = (name: FieldName, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const msg = validateField(name, value);
      const next = { ...e };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const onBlur = (name: FieldName) => {
    const msg = validateField(name, values[name] ?? "");
    setErrors((e) => {
      const next = { ...e };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const validateAll = () => {
    const next: Partial<Record<FieldName, string>> = {};
    for (const name of FIELD_ORDER) {
      // Guardian fields are only relevant (and required) for minors.
      if ((name === "guardianName" || name === "guardianEmail") && !isMinor) continue;
      const msg = validateField(name, values[name] ?? "");
      if (msg) next[name] = msg;
    }
    return next;
  };

  const focusFirstError = (errs: Partial<Record<FieldName, string>>) => {
    const first = FIELD_ORDER.find((n) => errs[n]);
    if (first) refs.current[first]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = validateAll();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(found);
      return;
    }

    // Eligibility gate (mirrors the server). Ineligible → shippable notice, no POST.
    if (elig.status === "too_young" || elig.status === "too_old") {
      setIneligibleReason(elig.status);
      setStatus("ineligible");
      return;
    }

    // Minor consent — guardian name + email required (and not the applicant's own).
    const gErrs = guardianConsentErrors({
      isMinor,
      guardianName: values.guardianName,
      guardianEmail: values.guardianEmail,
      applicantEmail: values.email,
    });
    if (Object.keys(gErrs).length > 0) {
      setErrors((prev) => ({ ...prev, ...gErrs }));
      focusFirstError(gErrs as Partial<Record<FieldName, string>>);
      return;
    }

    if (SITE_KEY && !token) {
      setFormError("Please complete the human-verification check below.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-hxp-signup": "1" },
        body: JSON.stringify({ ...values, website, turnstileToken: token ?? undefined }),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        fieldErrors?: Partial<Record<FieldName, string>>;
      };
      setStatus("idle");

      if (res.status === 422 && data.error === "ineligible") {
        // Server is authoritative — honor its eligibility decision even if the
        // client somehow disagreed (e.g. a tampered form).
        setIneligibleReason(data.reason === "too_old" ? "too_old" : "too_young");
        setStatus("ineligible");
      } else if (res.status === 400 && data.error === "validation" && data.fieldErrors) {
        setErrors(data.fieldErrors);
        focusFirstError(data.fieldErrors);
        setFormError("Please fix the highlighted fields and try again.");
      } else if (res.status === 429) {
        setFormError("That's a few tries in a short window. Please wait a minute, then try again.");
        setToken(null);
      } else if (data.error === "captcha_failed") {
        setFormError("Verification didn't go through — please try the check again.");
        setToken(null);
      } else {
        setFormError("Something went wrong on our end. Please try again in a moment.");
      }
    } catch {
      setStatus("idle");
      setFormError("Network error — check your connection and try again.");
    }
  };

  // ---- Ineligible state (shippable, kind) ----------------------------------
  if (status === "ineligible") {
    const tooYoung = ineligibleReason === "too_young";
    return (
      <div
        role="status"
        aria-live="polite"
        className="animate-fade-up rounded-2xl border border-brick/20 bg-white p-8 text-center shadow-card sm:p-10"
      >
        <h3
          ref={confirmHeadingRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold text-ink outline-none sm:text-3xl"
        >
          Thanks for your interest in HXP
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink/75">
          This expedition is open to Builders who are <strong>16–19 years old on the departure
          date</strong>. Based on the date of birth you entered, {tooYoung ? "you're not quite there yet" : "you're just outside the range for this trip"}.
        </p>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink/75">
          {tooYoung
            ? "We'd love to have you on a future trip when you're eligible — reach out and we'll keep you posted."
            : "HXP runs other expeditions and service opportunities — reach out and we'll help you find a fit."}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:info@hxp.org?subject=Interest%20in%20HXP%20expeditions"
            className="btn-chunky focus:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Email HXP
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setIneligibleReason(null);
            }}
            className="text-sm font-semibold text-ink/60 underline decoration-sand underline-offset-4 transition hover:text-brick"
          >
            I mistyped my date of birth — go back
          </button>
        </div>
      </div>
    );
  }

  // ---- Confirmation state --------------------------------------------------
  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="animate-fade-up rounded-2xl border border-brick/20 bg-white p-8 text-center shadow-card sm:p-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brick/12 text-brick">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h3
          ref={confirmHeadingRef}
          tabIndex={-1}
          className="mt-6 font-display text-2xl font-semibold text-ink outline-none sm:text-3xl"
        >
          {copy.confirmationTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink/70">{copy.confirmationBlurb}</p>
        <dl className="mx-auto mt-8 grid max-w-sm gap-3 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-paper px-4 py-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brick" />
            <dd className="text-sm text-ink/75">
              We emailed a confirmation to your inbox. If you don't see it, check spam.
            </dd>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-paper px-4 py-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brick" />
            <dd className="text-sm text-ink/75">
              {trip.name} · {trip.destination}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  // ---- Form ----------------------------------------------------------------
  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fade-up">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {FIELDS.filter((f) => !f.minorOnly || isMinor).map((f) => {
          const id = `field-${f.name}`;
          const errId = `${id}-error`;
          const hintId = `${id}-hint`;
          const hasError = Boolean(errors[f.name]);
          const describedBy = [f.hint ? hintId : null, hasError ? errId : null].filter(Boolean).join(" ") || undefined;

          const controlClass = [
            "w-full rounded-xl border bg-white px-4 py-3 text-ink shadow-sm transition",
            "placeholder:text-ink/35",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            hasError
              ? "border-brick/70 focus-visible:border-brick focus-visible:ring-brick/60"
              : "border-ink/15 hover:border-ink/25 focus-visible:border-brick focus-visible:ring-brick/50",
          ].join(" ");

          return (
            <div key={f.name} className={f.full || f.multiline ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
                {f.label}
                {f.required ? (
                  <span className="text-brick" aria-hidden="true">
                    {" "}*
                  </span>
                ) : (
                  <span className="ml-1 text-xs font-normal text-ink/40">(optional)</span>
                )}
              </label>

              {f.multiline ? (
                <textarea
                  id={id}
                  ref={(el) => {
                    refs.current[f.name] = el;
                  }}
                  name={f.name}
                  rows={f.name === "reason" ? 4 : 2}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  onBlur={() => onBlur(f.name)}
                  aria-invalid={hasError || undefined}
                  aria-describedby={describedBy}
                  required={f.required}
                  className={`${controlClass} resize-y`}
                />
              ) : (
                <input
                  id={id}
                  ref={(el) => {
                    refs.current[f.name] = el;
                  }}
                  name={f.name}
                  type={f.type}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  max={f.type === "date" ? trip.startDate : undefined}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  onBlur={() => onBlur(f.name)}
                  aria-invalid={hasError || undefined}
                  aria-describedby={describedBy}
                  required={f.required}
                  className={controlClass}
                />
              )}

              {f.hint && !hasError && (
                <p id={hintId} className="mt-1.5 text-xs text-ink/50">
                  {f.hint}
                </p>
              )}
              {hasError && (
                <p id={errId} role="alert" className="mt-1.5 text-xs font-medium text-brick">
                  {errors[f.name]}
                </p>
              )}
              {f.name === "dateOfBirth" && showIneligibleHint && !hasError && (
                <p className="mt-1.5 text-xs font-medium text-brick">
                  Heads up: this trip is for ages 16–19 on the departure date. You can continue, and
                  we'll show you options.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Honeypot — hidden from humans, catnip for bots. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website (leave blank)</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {SITE_KEY && (
        <div className="mt-5">
          <TurnstileWidget siteKey={SITE_KEY} onToken={handleToken} />
        </div>
      )}

      {formError && (
        <p role="alert" className="mt-5 rounded-xl border border-brick/30 bg-brick/8 px-4 py-3 text-sm font-medium text-brick">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-chunky group mt-6 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <SpinnerIcon className="h-5 w-5 animate-spin" />
            {copy.submittingLabel}
          </>
        ) : (
          <>
            {copy.submitLabel}
            <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink/50">
        <ShieldIcon className="h-4 w-4 text-brick" />
        Encrypted in transit. We only use your details to process your application.
      </p>
    </form>
  );
}
