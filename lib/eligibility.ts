// =============================================================================
// Eligibility rules for a trip sign-up (Round-2 change request).
// Shared by the client (UX) and the server (authoritative) so the two can't
// drift — same philosophy as the shared Zod schema.
//
// Policy:
//   • A Builder must be 16–19 years old ON THE TRIP'S DEPARTURE DATE (not the
//     sign-up date). Inclusive: 16 and 19 are eligible; turning 20 on/before
//     departure is too old; not yet 16 on departure is too young.
//   • "Minor" = under 18 ON THE DEPARTURE DATE → parent/guardian consent
//     (name + email) is required.
//
// All math is on plain calendar dates (no time, no timezone) so the result is
// identical in the user's browser, on the server, and during SSR.
// =============================================================================

export const MIN_AGE = 16;
export const MAX_AGE = 19;
export const ADULT_AGE = 18;

export interface CalendarDate {
  y: number;
  m: number; // 1–12
  d: number; // 1–31
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * Strictly parse "YYYY-MM-DD" into a calendar date, or null. Rejects wrong
 * shapes AND dates that don't exist (2009-02-31, 2010-13-01, 2007-02-29) —
 * `new Date()` would silently roll those over, which is a classic bug.
 */
export function parseCalendarDate(input: unknown): CalendarDate | null {
  if (typeof input !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return null;
  const daysInMonth = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (d > daysInMonth[mo - 1]) return null;
  return { y, m: mo, d };
}

/** True if a is strictly after b (calendar comparison). */
export function isAfter(a: CalendarDate, b: CalendarDate): boolean {
  if (a.y !== b.y) return a.y > b.y;
  if (a.m !== b.m) return a.m > b.m;
  return a.d > b.d;
}

/** Whole years from `dob` to `on` (no timezone drift). */
export function ageOnDate(dob: CalendarDate, on: CalendarDate): number {
  let age = on.y - dob.y;
  if (on.m < dob.m || (on.m === dob.m && on.d < dob.d)) age -= 1;
  return age;
}

export type EligibilityStatus = "eligible" | "too_young" | "too_old" | "invalid_dob";

export interface EligibilityResult {
  status: EligibilityStatus;
  eligible: boolean;
  isMinor: boolean; // under 18 on departure (meaningful only for a valid dob)
  ageAtDeparture: number | null;
}

/** Evaluate a date-of-birth string against a departure date ("YYYY-MM-DD"). */
export function evaluateEligibility(dobInput: unknown, departureISO: string): EligibilityResult {
  const dob = parseCalendarDate(dobInput);
  const dep = parseCalendarDate(departureISO);
  const invalid: EligibilityResult = {
    status: "invalid_dob",
    eligible: false,
    isMinor: false,
    ageAtDeparture: null,
  };
  if (!dob || !dep) return invalid;
  // Can't be born after you travel.
  if (isAfter(dob, dep)) return invalid;

  const age = ageOnDate(dob, dep);
  const isMinor = age < ADULT_AGE;
  if (age < MIN_AGE) return { status: "too_young", eligible: false, isMinor, ageAtDeparture: age };
  if (age > MAX_AGE) return { status: "too_old", eligible: false, isMinor, ageAtDeparture: age };
  return { status: "eligible", eligible: true, isMinor, ageAtDeparture: age };
}

function isEmailish(v: string): boolean {
  // Intentionally simple; the Zod schema does the authoritative email check.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * Guardian-consent rule for minors. Returns per-field error messages (empty
 * object = OK). Shared by client + server so the requirement can't drift.
 * `applicantEmail` blocks a minor from listing themselves as their own guardian.
 */
export function guardianConsentErrors(params: {
  isMinor: boolean;
  guardianName?: string;
  guardianEmail?: string;
  applicantEmail?: string;
}): { guardianName?: string; guardianEmail?: string } {
  const errors: { guardianName?: string; guardianEmail?: string } = {};
  if (!params.isMinor) return errors; // adults: guardian fields not required
  const name = (params.guardianName ?? "").trim();
  const email = (params.guardianEmail ?? "").trim();
  if (name.length < 2) {
    errors.guardianName = "A parent/guardian name is required for applicants under 18.";
  }
  if (!isEmailish(email)) {
    errors.guardianEmail = "A parent/guardian email is required for applicants under 18.";
  } else if (
    params.applicantEmail &&
    email.toLowerCase() === params.applicantEmail.trim().toLowerCase()
  ) {
    errors.guardianEmail = "The guardian's email must be different from the applicant's.";
  }
  return errors;
}
