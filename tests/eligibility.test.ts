import { describe, it, expect } from "vitest";
import {
  parseCalendarDate,
  ageOnDate,
  evaluateEligibility,
  guardianConsentErrors,
  ineligibleSuggestion,
} from "@/lib/eligibility";

const DEPART = "2027-02-06"; // the trip's departure date

describe("parseCalendarDate (strict, no rollover)", () => {
  it("parses a valid date", () => {
    expect(parseCalendarDate("2010-05-15")).toEqual({ y: 2010, m: 5, d: 15 });
  });
  it("accepts a leap day in a leap year", () => {
    expect(parseCalendarDate("2008-02-29")).toEqual({ y: 2008, m: 2, d: 29 });
  });
  it("rejects Feb 29 in a non-leap year", () => {
    expect(parseCalendarDate("2007-02-29")).toBeNull();
  });
  it("rejects a rollover date JS Date would silently accept (Feb 31)", () => {
    expect(parseCalendarDate("2009-02-31")).toBeNull();
  });
  it("rejects an impossible month/day", () => {
    expect(parseCalendarDate("2010-13-01")).toBeNull();
    expect(parseCalendarDate("2010-04-31")).toBeNull();
  });
  it("rejects wrong shapes and non-strings", () => {
    expect(parseCalendarDate("2010-2-5")).toBeNull();
    expect(parseCalendarDate("05/15/2010")).toBeNull();
    expect(parseCalendarDate("garbage")).toBeNull();
    expect(parseCalendarDate(20100205)).toBeNull();
    expect(parseCalendarDate(null)).toBeNull();
    expect(parseCalendarDate(undefined)).toBeNull();
  });
});

describe("ageOnDate", () => {
  it("counts a birthday on the exact departure day", () => {
    expect(ageOnDate({ y: 2011, m: 2, d: 6 }, { y: 2027, m: 2, d: 6 })).toBe(16);
  });
  it("does not count a birthday one day after departure", () => {
    expect(ageOnDate({ y: 2011, m: 2, d: 7 }, { y: 2027, m: 2, d: 6 })).toBe(15);
  });
});

describe("evaluateEligibility — age is measured AT DEPARTURE, not today", () => {
  const cases: Array<[string, string, boolean]> = [
    // [dob, expectedStatus, expectedEligible]
    ["2011-02-06", "eligible", true], // turns 16 exactly on departure — lower bound
    ["2011-02-07", "too_young", false], // turns 16 the day AFTER departure
    ["2007-02-07", "eligible", true], // 19 at departure, turns 20 the day after — upper bound
    ["2007-02-06", "too_old", false], // turns 20 exactly on departure
    ["2007-02-05", "too_old", false], // already 20 before departure
    ["2010-08-01", "eligible", true], // comfortably 16
    ["2009-02-06", "eligible", true], // turns 18 on departure (adult, still eligible)
  ];
  it.each(cases)("dob %s → %s", (dob, status, eligible) => {
    const r = evaluateEligibility(dob, DEPART);
    expect(r.status).toBe(status);
    expect(r.eligible).toBe(eligible);
  });

  it("flags minors (under 18 at departure) and adults correctly", () => {
    expect(evaluateEligibility("2010-02-06", DEPART).isMinor).toBe(true); // 17 → minor
    expect(evaluateEligibility("2009-02-07", DEPART).isMinor).toBe(true); // 17 (turns 18 after) → minor
    expect(evaluateEligibility("2009-02-06", DEPART).isMinor).toBe(false); // 18 → adult
    expect(evaluateEligibility("2007-02-07", DEPART).isMinor).toBe(false); // 19 → adult
  });

  it("handles a leap-year birthday without crashing (Feb 29)", () => {
    const r = evaluateEligibility("2008-02-29", DEPART);
    expect(r.status).toBe("eligible");
    expect(r.ageAtDeparture).toBe(18);
  });

  it("rejects a future / post-departure DOB as invalid", () => {
    expect(evaluateEligibility("2030-01-01", DEPART).status).toBe("invalid_dob");
    expect(evaluateEligibility("2027-02-07", DEPART).status).toBe("invalid_dob");
  });

  it("rejects malformed / impossible DOB as invalid", () => {
    expect(evaluateEligibility("2009-02-31", DEPART).status).toBe("invalid_dob");
    expect(evaluateEligibility("not-a-date", DEPART).status).toBe("invalid_dob");
    expect(evaluateEligibility("", DEPART).status).toBe("invalid_dob");
  });
});

describe("guardianConsentErrors", () => {
  it("requires nothing for adults", () => {
    expect(guardianConsentErrors({ isMinor: false })).toEqual({});
  });
  it("requires both guardian fields for a minor when missing", () => {
    const e = guardianConsentErrors({ isMinor: true });
    expect(e.guardianName).toBeTruthy();
    expect(e.guardianEmail).toBeTruthy();
  });
  it("passes for a minor with a valid guardian name + email", () => {
    expect(
      guardianConsentErrors({
        isMinor: true,
        guardianName: "Dana Rivera",
        guardianEmail: "dana@example.com",
        applicantEmail: "kid@example.com",
      }),
    ).toEqual({});
  });
  it("rejects a guardian email equal to the applicant's (can't self-consent)", () => {
    const e = guardianConsentErrors({
      isMinor: true,
      guardianName: "Dana Rivera",
      guardianEmail: "kid@example.com",
      applicantEmail: "KID@example.com", // case-insensitive match
    });
    expect(e.guardianEmail).toBeTruthy();
  });
  it("rejects an invalid guardian email", () => {
    const e = guardianConsentErrors({ isMinor: true, guardianName: "Dana", guardianEmail: "nope" });
    expect(e.guardianEmail).toBeTruthy();
  });
});

describe("ineligibleSuggestion (tailored redirects)", () => {
  it("suggests Trip Leader for 21–30 who are too old", () => {
    expect(ineligibleSuggestion("too_old", 21)).toBe("trip_leader");
    expect(ineligibleSuggestion("too_old", 25)).toBe("trip_leader");
    expect(ineligibleSuggestion("too_old", 30)).toBe("trip_leader");
  });
  it("does NOT suggest Trip Leader for 20 or 31+", () => {
    expect(ineligibleSuggestion("too_old", 20)).toBe("none");
    expect(ineligibleSuggestion("too_old", 31)).toBe("none");
  });
  it("suggests a domestic trip for 14–15 who are too young", () => {
    expect(ineligibleSuggestion("too_young", 14)).toBe("domestic");
    expect(ineligibleSuggestion("too_young", 15)).toBe("domestic");
  });
  it("does NOT suggest domestic for under 14", () => {
    expect(ineligibleSuggestion("too_young", 13)).toBe("none");
  });
  it("returns none for eligible or null age", () => {
    expect(ineligibleSuggestion("eligible", 17)).toBe("none");
    expect(ineligibleSuggestion("too_old", null)).toBe("none");
  });
});
