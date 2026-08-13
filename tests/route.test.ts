import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/signup/route";

const validBody = {
  fullName: "Jordan Rivera",
  email: "jordan@example.com",
  dateOfBirth: "2008-06-15", // 18 on departure (2027-02-06): eligible adult, no guardian needed
  phone: "+1 555 123 4567",
  emergencyName: "Casey Rivera",
  emergencyPhone: "555 987 6543",
  dietary: "",
  reason: "I want to serve and build alongside the community.",
};

// Each test uses a distinct IP so the module-level in-memory rate limiter
// (keyed per IP) never bleeds between tests.
function makeReq(opts: {
  ip: string;
  body?: unknown;
  rawBody?: string;
  contentType?: string | null; // default application/json
  includeSignupHeader?: boolean; // default true
  origin?: string | null; // default http://localhost; null = omit
  contentLength?: string;
}): NextRequest {
  const h: Record<string, string> = { host: "localhost", "x-forwarded-for": opts.ip };
  const ct = opts.contentType === undefined ? "application/json" : opts.contentType;
  if (ct !== null) h["content-type"] = ct;
  if (opts.includeSignupHeader !== false) h["x-hxp-signup"] = "1";
  const origin = opts.origin === undefined ? "http://localhost" : opts.origin;
  if (origin !== null) h["origin"] = origin;
  if (opts.contentLength) h["content-length"] = opts.contentLength;
  const body = opts.rawBody !== undefined ? opts.rawBody : JSON.stringify(opts.body ?? {});
  return new NextRequest("http://localhost/api/signup", { method: "POST", headers: h, body });
}

describe("POST /api/signup", () => {
  it("accepts a valid submission (200, ok, no PII echoed)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.1", body: validBody }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
  });

  it("rejects a non-JSON content type (415)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.2", contentType: "text/plain", body: validBody }));
    expect(res.status).toBe(415);
  });

  it("rejects a missing custom header — CSRF guard (403)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.3", body: validBody, includeSignupHeader: false }));
    expect(res.status).toBe(403);
  });

  it("rejects a cross-origin request (403)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.4", body: validBody, origin: "http://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rejects a non-object JSON body without throwing 500 (400 invalid_json)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.5", rawBody: "null" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("invalid_json");
  });

  it("returns field errors for an invalid submission (400 validation)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.6", body: { fullName: "A", email: "nope" } }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("validation");
    expect(data.fieldErrors).toBeTruthy();
    expect(Object.keys(data.fieldErrors).length).toBeGreaterThan(0);
  });

  it("silently accepts a honeypot hit without persisting (200)", async () => {
    const res = await POST(makeReq({ ip: "10.0.0.7", body: { ...validBody, website: "http://spam.example" } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
  });

  it("rejects an oversized declared body (413)", async () => {
    const res = await POST(
      makeReq({ ip: "10.0.0.8", body: validBody, contentLength: String(17 * 1024) }),
    );
    expect(res.status).toBe(413);
  });

  it("rate-limits a burst from one IP (429 after the configured max)", async () => {
    const ip = "203.0.113.99";
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await POST(makeReq({ ip, body: { ...validBody, website: "bot" } }));
      statuses.push(res.status);
    }
    // Default RATE_LIMIT_MAX is 5 → the 6th+ request in the window is blocked.
    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses).toContain(429);
  });

  // ---- Round 2: eligibility + guardian consent (server-authoritative) ----

  const minorBody = {
    ...validBody,
    dateOfBirth: "2010-06-15", // 16 on departure (2027-02-06): eligible MINOR
    guardianName: "Dana Rivera",
    guardianEmail: "dana@example.com",
  };

  it("rejects an applicant too young at departure (422 ineligible)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.1", body: { ...validBody, dateOfBirth: "2015-01-01" } }));
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBe("ineligible");
    expect(data.reason).toBe("too_young");
  });

  it("rejects an applicant too old at departure (422 ineligible)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.2", body: { ...validBody, dateOfBirth: "2000-01-01" } }));
    expect(res.status).toBe(422);
    expect((await res.json()).reason).toBe("too_old");
  });

  it("enforces the departure-date boundary: turning 16 the day AFTER departure is too young", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.3", body: { ...validBody, dateOfBirth: "2011-02-07" } }));
    expect(res.status).toBe(422);
    expect((await res.json()).reason).toBe("too_young");
  });

  it("accepts exactly 16 on departure (a minor, so guardian required) → 200", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.4", body: { ...minorBody, dateOfBirth: "2011-02-06" } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("requires guardian name + email for a minor (400 with both field errors)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.5", body: { ...validBody, dateOfBirth: "2010-06-15" } }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("validation");
    expect(data.fieldErrors.guardianName).toBeTruthy();
    expect(data.fieldErrors.guardianEmail).toBeTruthy();
  });

  it("accepts a minor WITH valid guardian consent (200)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.6", body: minorBody }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("blocks a minor from listing themselves as guardian (400)", async () => {
    const res = await POST(
      makeReq({ ip: "10.1.0.7", body: { ...minorBody, guardianEmail: minorBody.email } }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors.guardianEmail).toBeTruthy();
  });

  it("does NOT require guardian info for an eligible adult (18–19) → 200", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.8", body: { ...validBody, dateOfBirth: "2007-06-15" } }));
    expect(res.status).toBe(200);
  });

  it("rejects a missing DOB (400 validation)", async () => {
    const { dateOfBirth, ...noDob } = validBody;
    void dateOfBirth;
    const res = await POST(makeReq({ ip: "10.1.0.9", body: noDob }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("validation");
  });

  it("rejects a rollover / impossible DOB (400 validation)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.10", body: { ...validBody, dateOfBirth: "2010-02-31" } }));
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors.dateOfBirth).toBeTruthy();
  });

  it("CLIENT BYPASS: a direct POST with an ineligible DOB is still enforced (422)", async () => {
    const res = await POST(makeReq({ ip: "10.1.0.11", body: { ...validBody, dateOfBirth: "1990-01-01" } }));
    expect(res.status).toBe(422);
  });
});
