import { describe, it, expect } from "vitest";
import { signupSchema, validateField } from "@/lib/validation";

const valid = {
  fullName: "María O'Brien-Smith",
  email: "  Test@Example.COM ",
  phone: "+1 (555) 123-4567",
  emergencyName: "Jordan Lee",
  emergencyPhone: "555-987-6543",
  dietary: "  none  ",
  reason: "I want to serve alongside the community and grow.",
};

describe("signupSchema (authoritative server schema)", () => {
  it("accepts a well-formed submission and normalizes it", () => {
    const parsed = signupSchema.parse(valid);
    // email is trimmed + lowercased
    expect(parsed.email).toBe("test@example.com");
    // whitespace-only-adjacent values are trimmed
    expect(parsed.fullName).toBe("María O'Brien-Smith");
    expect(parsed.dietary).toBe("none");
  });

  it("defaults dietary to '' when omitted (it's optional)", () => {
    const { dietary, ...rest } = valid;
    void dietary;
    const parsed = signupSchema.parse(rest);
    expect(parsed.dietary).toBe("");
  });

  it("rejects a name that is too short", () => {
    const r = signupSchema.safeParse({ ...valid, fullName: "A" });
    expect(r.success).toBe(false);
  });

  it("rejects a name containing digits/symbols (XSS-shaped input)", () => {
    const r = signupSchema.safeParse({ ...valid, fullName: "<script>alert(1)</script>" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const r = signupSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a phone with too few digits", () => {
    const r = signupSchema.safeParse({ ...valid, phone: "12" });
    expect(r.success).toBe(false);
  });

  it("rejects a phone with letters", () => {
    const r = signupSchema.safeParse({ ...valid, phone: "call-me-maybe" });
    expect(r.success).toBe(false);
  });

  it("rejects a reason under 10 characters", () => {
    const r = signupSchema.safeParse({ ...valid, reason: "hi" });
    expect(r.success).toBe(false);
  });

  it("rejects a reason over 1000 characters", () => {
    const r = signupSchema.safeParse({ ...valid, reason: "x".repeat(1001) });
    expect(r.success).toBe(false);
  });

  it("rejects dietary notes over 300 characters", () => {
    const r = signupSchema.safeParse({ ...valid, dietary: "x".repeat(301) });
    expect(r.success).toBe(false);
  });
});

describe("validateField (client-side, same schema)", () => {
  it("returns null for a valid field", () => {
    expect(validateField("email", "a@b.com")).toBeNull();
  });

  it("returns a message string for an invalid field", () => {
    const msg = validateField("email", "nope");
    expect(typeof msg).toBe("string");
    expect(msg).toBeTruthy();
  });
});
