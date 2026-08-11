import { createClient } from "@supabase/supabase-js";
import type { SignupInput } from "./validation";

// =============================================================================
// Pluggable persistence.
// Primary sink: Supabase (Postgres) via the official client — parameterized
// under the hood, so no string-built SQL / injection surface.
// Fallback: if Supabase env vars are absent, we DON'T persist and log only a
// non-PII marker, so the app is demoable before a DB is wired up.
// The service-role key is read server-side only and never shipped to the client.
// =============================================================================

export interface StoredSignup extends SignupInput {
  tripSlug: string;
  submittedAt: string; // ISO
}

export type SaveResult = { persisted: boolean };

export async function saveSubmission(data: StoredSignup): Promise<SaveResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Dev/demo fallback. Deliberately logs NO field contents (PII hygiene) —
    // only a timestamp + which trip, so ops can confirm the pipe works.
    console.info(
      `[signup] received for trip=${data.tripSlug} at ${data.submittedAt} — no DB configured, not persisted`,
    );
    return { persisted: false };
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("signups").insert({
    trip_slug: data.tripSlug,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    emergency_name: data.emergencyName,
    emergency_phone: data.emergencyPhone,
    dietary: data.dietary,
    reason: data.reason,
    submitted_at: data.submittedAt,
  });

  if (error) {
    // Log the error CODE only — never the payload (would leak PII to logs).
    console.error(`[signup] persist failed: ${error.code ?? "unknown"}`);
    throw new Error("persist_failed");
  }

  return { persisted: true };
}
