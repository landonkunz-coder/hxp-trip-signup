// =============================================================================
// Sanitization helpers. Defense-in-depth against XSS + dirty input.
// Free-text is cleaned on the server BEFORE it is stored, so the stored value
// is inert plain text regardless of what later renders it (admin UI, email,
// CSV export). React also escapes on render — belt and suspenders.
// =============================================================================

// Strip C0/C1 control characters while preserving tab, newline, and carriage
// return so multi-line free-text survives. Built via constructor to keep the
// source pure-ASCII (no literal control bytes in the file).
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]",
  "g",
);

/** HTML-entity-encode the five significant characters. Use at any HTML sink. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function stripControlChars(input: string): string {
  return input.replace(CONTROL_CHARS, "");
}

/**
 * Clean free-text destined for storage + later render:
 * remove control chars, strip anything tag-shaped, drop stray angle brackets,
 * and collapse runs of whitespace. Result is safe, inert plain text.
 */
export function sanitizeFreeText(input: string): string {
  return stripControlChars(input)
    .replace(/<[^>]*>/g, "") // remove tag-like sequences (e.g. <script>)
    .replace(/[<>]/g, "") // drop any residual angle brackets
    .replace(/[ \t\f\v]{2,}/g, " ") // collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n") // cap blank lines
    .trim();
}

/**
 * Neutralize spreadsheet formula injection for CSV/XLSX export sinks. We store
 * raw text (never mangle the user's data on the way in); any code that later
 * exports submissions to a spreadsheet must pass each cell through this so a
 * value like "=cmd|..." can't execute when opened in Excel/Sheets.
 */
export function escapeCsvField(input: string): string {
  return /^[=+\-@\t\r]/.test(input) ? `'${input}` : input;
}
