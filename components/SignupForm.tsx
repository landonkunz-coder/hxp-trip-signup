"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Trip } from "@/data/trip";
import { FIELD_ORDER, validateField, type SignupInput } from "@/lib/validation";
import { modeCopy } from "@/lib/tripMode";
import { CheckIcon, ShieldIcon, SpinnerIcon, ArrowIcon } from "@/components/Icons";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FieldName = keyof SignupInput;
type Status = "idle" | "submitting" | "success";

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
}

const FIELDS: FieldDef[] = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name", placeholder: "Your legal name", required: true, full: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email", placeholder: "you@example.com", required: true },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+1 555 123 4567", required: true },
  { name: "emergencyName", label: "Emergency contact", type: "text", autoComplete: "off", placeholder: "Their full name", required: true, hint: "Someone we can reach while you travel." },
  { name: "emergencyPhone", label: "Emergency contact phone", type: "tel", autoComplete: "off", inputMode: "tel", placeholder: "+1 555 987 6543", required: true },
  { name: "dietary", label: "Dietary restrictions", multiline: true, full: true, placeholder: "Allergies, vegetarian, none…", hint: "Optional — helps us plan meals." },
  { name: "reason", label: "Why do you want to come?", multiline: true, full: true, placeholder: "A sentence or two is plenty.", required: true },
];

const EMPTY: SignupInput = {
  fullName: "", email: "", phone: "", emergencyName: "", emergencyPhone: "", dietary: "", reason: "",
};

export function SignupForm({ trip }: { trip: Trip }) {
  const copy = modeCopy(trip.mode, trip.spotsRemaining);

  const [values, setValues] = useState<SignupInput>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const refs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const handleToken = useCallback((t: string | null) => setToken(t), []);

  // Move focus to the confirmation heading so screen-reader + keyboard users
  // are told the submission succeeded (the form is replaced on success).
  useEffect(() => {
    if (status === "success") confirmHeadingRef.current?.focus();
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
        fieldErrors?: Partial<Record<FieldName, string>>;
      };
      setStatus("idle");

      if (res.status === 400 && data.error === "validation" && data.fieldErrors) {
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
        {FIELDS.map((f) => {
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
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brick px-6 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-[#b4463b] focus:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-70"
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
