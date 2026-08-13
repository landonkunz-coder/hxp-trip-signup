import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { sanitizeFreeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { saveSubmission } from "@/lib/persistence";
import { getFeaturedTrip } from "@/data/trip";
import { evaluateEligibility, guardianConsentErrors } from "@/lib/eligibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024; // 16 KB — this is a small form, nothing legit is bigger.

/** Parse an env int, falling back to a default on missing/NaN/non-positive. */
function toPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const RATE_LIMIT_MAX = toPositiveInt(process.env.RATE_LIMIT_MAX, 5);
const RATE_LIMIT_WINDOW = toPositiveInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 600);

/** Consistent JSON response with no-store (never cache a form endpoint). */
function json(body: unknown, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

// NOTE (trust boundary): X-Forwarded-For / X-Real-IP are only trustworthy when a
// proxy in front of this route (e.g. Vercel's edge) overwrites them and direct
// origin access is blocked. If the origin is directly reachable, a client can
// spoof XFF to farm fresh rate-limit buckets. See README "harden next."
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Same-origin + custom-header check. Cheap, effective CSRF defense for a
 *  cookieless endpoint: a cross-site <form> can't set a custom header (it would
 *  trigger a CORS preflight we never allow), and the Origin must match host. */
function failsOriginCheck(req: NextRequest): boolean {
  if (req.headers.get("x-hxp-signup") !== "1") return true;
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host !== host;
    } catch {
      return true;
    }
  }
  // Some same-origin clients omit Origin; fall back to Referer, then to the
  // custom-header requirement above (which a cross-site form cannot satisfy).
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host !== host;
    } catch {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  // 1) Reject non-JSON early.
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  // 2) CSRF / origin.
  if (failsOriginCheck(req)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  // 3) Rate limit per IP.
  const ip = clientIp(req);
  const rl = rateLimit(`signup:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rl.ok) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(rl.retryAfterSeconds),
    });
  }

  // 4) Body size guard + parse. Reject on declared Content-Length before we
  //    read the stream, then re-check the true UTF-8 byte length after.
  const declaredLen = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }
  let payload: Record<string, unknown>;
  try {
    const decoded: unknown = JSON.parse(raw);
    // JSON.parse succeeds for "null", numbers, and arrays too — require a plain
    // object so later property access (payload.website, etc.) can't throw a 500.
    if (decoded === null || typeof decoded !== "object" || Array.isArray(decoded)) {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    payload = decoded as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // 5) Honeypot. Bots fill hidden fields; humans never see it. Silent success
  //    so we don't teach a scraper what tripped it.
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return json({ ok: true }, 200);
  }

  // 6) Turnstile (skipped automatically if not configured).
  const turnstileToken =
    typeof payload.turnstileToken === "string" ? payload.turnstileToken : undefined;
  const humanOk = await verifyTurnstile(turnstileToken, ip === "unknown" ? undefined : ip);
  if (!humanOk) {
    return json({ ok: false, error: "captcha_failed" }, 400);
  }

  // 7) Authoritative server-side validation with the SAME schema the client uses.
  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return json({ ok: false, error: "validation", fieldErrors }, 400);
  }

  const trip = getFeaturedTrip();

  // 7b) Eligibility — AUTHORITATIVE. Age is measured on the trip's DEPARTURE
  //     date, not the sign-up date. "Ineligible" is a business outcome, not a
  //     malformed request, so it gets its own response the UI renders kindly.
  const elig = evaluateEligibility(parsed.data.dateOfBirth, trip.startDate);
  if (elig.status === "invalid_dob") {
    return json(
      { ok: false, error: "validation", fieldErrors: { dateOfBirth: "Enter a valid date of birth." } },
      400,
    );
  }
  if (!elig.eligible) {
    return json({ ok: false, error: "ineligible", reason: elig.status }, 422);
  }

  // 7c) Minor consent — parent/guardian name + email required for under-18s
  //     (measured on departure); the guardian can't be the applicant.
  const guardianErrors = guardianConsentErrors({
    isMinor: elig.isMinor,
    guardianName: parsed.data.guardianName,
    guardianEmail: parsed.data.guardianEmail,
    applicantEmail: parsed.data.email,
  });
  if (Object.keys(guardianErrors).length > 0) {
    return json({ ok: false, error: "validation", fieldErrors: guardianErrors }, 400);
  }

  // 8) Sanitize free-text before it is ever stored/rendered.
  const clean = {
    ...parsed.data,
    dietary: sanitizeFreeText(parsed.data.dietary ?? ""),
    reason: sanitizeFreeText(parsed.data.reason),
    // Keep guardian info only for minors (who require it); drop it otherwise.
    guardianName: elig.isMinor ? parsed.data.guardianName ?? "" : "",
    guardianEmail: elig.isMinor ? parsed.data.guardianEmail ?? "" : "",
  };

  // 9) Persist (parameterized client) — or dev fallback if no DB configured.
  try {
    await saveSubmission({
      ...clean,
      tripSlug: trip.slug,
      submittedAt: new Date().toISOString(),
    });
  } catch {
    // Never echo the payload back or into logs.
    return json({ ok: false, error: "server_error" }, 500);
  }

  // 10) Minimal success — no PII echoed in the response body.
  return json({ ok: true }, 200);
}
