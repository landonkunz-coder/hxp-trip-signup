# Design Handoff — finish the "Crafted" restyle

**Goal:** finish restyling this Next.js site so the whole page matches the chosen mockup
`../design-concepts/concept-3-crafted.html` ("Crafted / HXP-native"). The **hero already
matches** it; the sections below the hero still need the tactile treatment applied.

**Recommended tool to continue:** **Cursor** (Agent/Composer mode, Claude Sonnet) — open this
repo, add `../design-concepts/concept-3-crafted.html` and this file to context, and ask it to
"apply the Crafted treatment to the remaining sections per DESIGN-HANDOFF.md, without touching
the security/validation files, and keep `npm run build` passing." **Claude Code** (CLI) works
equally well and you already have it. (Avoid v0/Lovable here — they regenerate apps rather than
edit this hardened codebase.)

---

## Design system (already wired into `tailwind.config.ts` + `app/globals.css`)

**Fonts** (self-hosted via `@fontsource`, imported in `app/layout.tsx`):
- `font-display` and `font-sans` → **Zilla Slab** (heavy slab serif; use `font-bold` for headings)
- `font-hand` → **Caveat** (handwritten accents)

**Colors** (Tailwind tokens):
`ink #3a2b1e` (warm brown text/dark), `cream #f0e5cf` (page bg), `card #fbf5e6` (card stock),
`sand #cdb994` (borders/lines), `brick #cd5144` (terracotta accent), `brickdeep #a63a30`
(button borders/shadows), `gold #d9b877` (highlighter).

**Reusable utility classes** (in `globals.css`):
- `.btn-chunky` — pressable terracotta button with hard drop-shadow. Use for ALL primary CTAs.
- `.hl` — gold highlighter behind a word (parent needs `isolate`). e.g. `<span className="hl">Build</span>`.
- `.topline` — the woven terracotta stripe (already at top of the page in `app/page.tsx`).
- `.topo` / `.topo-dark` — topographic contour texture (`.topo` on the body; `.topo-dark` on dark bands).

**Signature motifs from the mockup to reuse:** dashed-border chips (`border border-dashed border-sand bg-card`),
tilted "field-note" cards that straighten on hover, numbered **wax-seal** badges (terracotta circle,
`absolute -top-4 left-6`, `border-2 border-card`), taped **polaroid** photos, and Caveat scribbles.

---

## Status

**DONE — every section now matches `concept-3-crafted.html`** (verified in-browser + `npm run build` passes):
- Global fonts + warm palette + topographic texture + topline.
- **Hero** — boxed HXP mark, nav, scribble, gold-underlined "Build", dashed chips, chunky button, taped polaroid.
- **Highlights** — numbered terracotta wax-seal field-note cards (hand-tilt, gold-underline titles).
- **ImpactStats** — terracotta band, big Zilla Slab numbers, Caveat subtitles.
- **TripDetails** — card-stock "included" list + dashed "not included" card; dark aside with handwritten
  "at a glance" and a `.btn-chunky` CTA.
- **Itinerary** — terracotta seal day-markers on a fading rail.
- **ApplySection** — dashed "fieldnote" form frame with gold tape + "save your spot" Caveat accent;
  seal step-markers; `.btn-chunky` submit (visual only — validation/honeypot/aria untouched).
- **Footer** — light parchment bar, Zilla Slab terracotta mark, uppercase muted meta.

**REMAINING:** none — the restyle is complete. Optional polish only, e.g. a `hand` accent prop on
`SectionHeading` or warmer input borders inside `SignupForm` (visual only, keep validation intact).

---

## Hard constraints (do NOT break)

- **Never edit** these (security-critical): `app/api/signup/route.ts`, `lib/validation.ts`,
  `lib/sanitize.ts`, `lib/rateLimit.ts`, `lib/turnstile.ts`, `lib/persistence.ts`.
- In `SignupForm.tsx`, **visual/layout only** — do not change validation, honeypot, submit
  behavior, or accessibility attributes.
- Keep the CSP in `next.config.js` intact. It's strict in production; `'unsafe-eval'` is added
  **only in dev** (Next Fast Refresh). Don't add origins except the existing
  `images.unsplash.com` in `img-src`.
- Preserve accessibility (labels, focus rings, alt text, `prefers-reduced-motion`) and
  mobile responsiveness. Scroll reveals (`components/Reveal.tsx`) + Lenis smooth scroll
  (`components/SmoothScroll.tsx`, via `components/Providers.tsx`) are already wired — keep them.

## Verify + ship

- After changes: `npm run build` must compile cleanly. (Dev: `npm run dev`; component/CSS edits
  hot-reload, but changes to `tailwind.config.ts` / `next.config.js` / new deps need a dev restart.)
- Deploy: `git push` — Vercel auto-deploys. Live: https://scenario-2-microsite.vercel.app
- After adding libraries, re-run `npm audit` (currently **0 vulnerabilities**).
