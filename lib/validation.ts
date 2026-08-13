import { z } from "zod";
import { parseCalendarDate } from "./eligibility";

// =============================================================================
// SINGLE SOURCE OF TRUTH for field validation.
// Imported by BOTH the client form (fast UX feedback) and the server endpoint
// (authoritative). Client validation is a convenience; the server never trusts
// it and re-validates every field with this exact schema.
// =============================================================================

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `Please enter your ${label}.`)
    .max(80, `That ${label} is too long.`)
    // Letters (any language), marks, spaces, and . ' - only. No digits/symbols.
    .regex(/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u, `Use letters, spaces, and - . ' only.`);

const phoneField = (label: string) =>
  z
    .string()
    .trim()
    .min(7, `Please enter a valid ${label}.`)
    .max(20, `That ${label} is too long.`)
    .regex(/^[0-9+().\-\s]+$/, `Use digits and + ( ) - . only.`)
    .refine((v) => v.replace(/\D/g, "").length >= 7, `Please enter a valid ${label}.`);

// Date of birth: strict YYYY-MM-DD that must be a real calendar date. The
// age-range/eligibility decision lives in lib/eligibility.ts (it needs the
// trip's departure date); this only guarantees the value is a valid date.
const dobField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth as YYYY-MM-DD.")
  .refine((v) => parseCalendarDate(v) !== null, "That date doesn't exist.");

const guardianNameField = z
  .string()
  .trim()
  .min(2, "Enter the parent/guardian's full name.")
  .max(80, "That name is too long.")
  .regex(/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u, "Use letters, spaces, and - . ' only.");

const guardianEmailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid parent/guardian email.")
  .max(254, "That email is too long.");

export const signupSchema = z.object({
  fullName: nameField("full name"),
  dateOfBirth: dobField,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address.")
    .max(254, "That email is too long."),
  phone: phoneField("phone number"),
  emergencyName: nameField("emergency contact name"),
  emergencyPhone: phoneField("emergency contact phone"),
  // Guardian fields are optional at the schema level (adults don't need them);
  // they become REQUIRED for minors via guardianConsentErrors() on both client
  // and server. If provided, they must be well-formed.
  guardianName: z.union([z.literal(""), guardianNameField]).optional(),
  guardianEmail: z.union([z.literal(""), guardianEmailField]).optional(),
  dietary: z
    .string()
    .trim()
    .max(300, "Keep dietary notes under 300 characters.")
    .optional()
    .default(""),
  reason: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(1000, "Keep this under 1000 characters."),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const FIELD_ORDER: (keyof SignupInput)[] = [
  "fullName",
  "email",
  "dateOfBirth",
  "phone",
  "emergencyName",
  "emergencyPhone",
  "guardianName",
  "guardianEmail",
  "dietary",
  "reason",
];

/** Validate one field on the client. Returns the first error message, or null. */
export function validateField(field: keyof SignupInput, value: string): string | null {
  const shape = signupSchema.shape[field];
  const result = shape.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message ?? "Invalid value.";
}
