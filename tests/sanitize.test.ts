import { describe, it, expect } from "vitest";
import {
  sanitizeFreeText,
  stripControlChars,
  escapeHtml,
  escapeCsvField,
} from "@/lib/sanitize";

// Build control characters programmatically so the source stays pure ASCII.
const NUL = String.fromCharCode(0);
const BELL = String.fromCharCode(7);
const DEL = String.fromCharCode(127);

describe("sanitizeFreeText (free-text cleaned BEFORE storage)", () => {
  it("removes tag-shaped content like <script>", () => {
    const out = sanitizeFreeText("Hello <script>alert('x')</script> world");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("script");
    expect(out).toContain("Hello");
    expect(out).toContain("world");
  });

  it("drops residual angle brackets", () => {
    expect(sanitizeFreeText("a < b > c")).not.toMatch(/[<>]/);
  });

  it("strips control chars but preserves newline and tab", () => {
    const out = sanitizeFreeText(`line1\nline2${NUL}${BELL}${DEL}\tend`);
    expect(out).toContain("line1");
    expect(out).toContain("line2");
    expect(out).toContain("\n"); // newline preserved for multi-line notes
    expect(out).toContain("\t"); // tab preserved
    expect(out).not.toContain(NUL);
    expect(out).not.toContain(BELL);
    expect(out).not.toContain(DEL);
  });

  it("collapses runs of horizontal whitespace and trims", () => {
    expect(sanitizeFreeText("  too      many    spaces  ")).toBe("too many spaces");
  });
});

describe("stripControlChars", () => {
  it("removes NUL but preserves tab", () => {
    expect(stripControlChars(`a${NUL}bc\td`)).toBe("abc\td");
  });
});

describe("escapeHtml", () => {
  it("encodes the five significant HTML characters", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });
});

describe("escapeCsvField (spreadsheet formula-injection guard)", () => {
  it("prefixes values that start with a formula trigger", () => {
    expect(escapeCsvField("=cmd|'/c calc'!A0")).toBe("'=cmd|'/c calc'!A0");
    expect(escapeCsvField("+1")).toBe("'+1");
    expect(escapeCsvField("-1")).toBe("'-1");
    expect(escapeCsvField("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("leaves ordinary values untouched", () => {
    expect(escapeCsvField("Vanuatu")).toBe("Vanuatu");
  });
});
