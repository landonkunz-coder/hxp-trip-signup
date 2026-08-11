import type { TripMode } from "@/data/trip";

// =============================================================================
// Mode-driven copy. Because the trip carries a `mode`, the CTA, form, and
// confirmation all adapt with zero markup changes. A "trip sold out, add a
// waitlist" request is a one-word data edit (mode: "open" -> "waitlist").
// =============================================================================

export interface ModeCopy {
  badge: string | null;
  ctaLabel: string;
  formEyebrow: string;
  formTitle: string;
  formBlurb: string;
  submitLabel: string;
  submittingLabel: string;
  confirmationTitle: string;
  confirmationBlurb: string;
}

export function modeCopy(mode: TripMode, spotsRemaining: number): ModeCopy {
  switch (mode) {
    case "waitlist":
      return {
        badge: "Trip full — waitlist open",
        ctaLabel: "Join the waitlist",
        formEyebrow: "Waitlist",
        formTitle: "Join the waitlist",
        formBlurb:
          "This departure is full, but spots open up. Add your details and we'll reach out the moment one does — in the order we receive them.",
        submitLabel: "Join the waitlist",
        submittingLabel: "Adding you…",
        confirmationTitle: "You're on the list",
        confirmationBlurb:
          "You're on the waitlist for this expedition. If a spot opens, we'll email you right away with next steps.",
      };
    case "sold_out":
      return {
        badge: "Sold out",
        ctaLabel: "Get notified about the next trip",
        formEyebrow: "Stay in the loop",
        formTitle: "Be first to know",
        formBlurb:
          "This expedition is sold out. Leave your details and we'll tell you the moment the next departure opens for applications.",
        submitLabel: "Notify me",
        submittingLabel: "Saving…",
        confirmationTitle: "We'll be in touch",
        confirmationBlurb:
          "Thanks — we'll email you when the next HXP expedition opens for sign-ups.",
      };
    case "open":
    default:
      return {
        badge:
          spotsRemaining > 0 && spotsRemaining <= 12
            ? `Only ${spotsRemaining} spots left`
            : "Applications open",
        ctaLabel: "Apply to join",
        formEyebrow: "Apply to join",
        formTitle: "Claim your spot",
        formBlurb:
          "Tell us a little about yourself. It takes two minutes, and a real person from our Builder Experience team will read your application.",
        submitLabel: "Submit application",
        submittingLabel: "Sending…",
        confirmationTitle: "Application received",
        confirmationBlurb:
          "You're in the queue. A member of our Builder Experience team will follow up by email within two business days with the next steps.",
      };
  }
}
