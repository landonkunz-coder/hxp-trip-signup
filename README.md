# HXP — Vanuatu Build Expedition sign-up microsite

A small, polished, mobile-first public sign-up site for a single HXP humanitarian
expedition. A prospective Builder can read the trip details and submit an
application that is validated and sanitized on the server before it's stored.

- **Live site:** https://scenario-2-microsite.vercel.app
- **Repo:** https://github.com/landonkunz-coder/hxp-trip-signup

Built AI-assisted, on purpose — see [AI Workflow](#ai-workflow) for which model did
what and why, and one example of AI output I rejected.

---

## What's here

- A **landing page** — hero, trip facts (dates, destination, price, duration),
  "why HXP" highlights, what's-included / not-included, a day-by-day itinerary,
  and a clear CTA.
- A **sign-up form** — full name, email, phone, emergency contact (name + phone),
  dietary restrictions, and a free-text "why do you want to come." Validated
  **client-side and server-side**, POSTs JSON to a serverless route handler.
- A **confirmation state** after a successful submit.
- **Mode-aware** copy: the trip carries `mode: "open" | "waitlist" | "sold_out"`,
  and the CTA, form, and confirmation adapt automatically (this is also the
  Round-2 resilience story — see below).

## Design — a deliberate "field-note" identity

The visual language is built to feel handcrafted and mission-driven, not like default
framework styling:

- **Typography:** Zilla Slab (a sturdy slab-serif) for headings and body, paired with
  Caveat (handwritten) for human accents — trip scribbles, photo captions, "at a glance."
- **Palette:** warm parchment/cream, terracotta (`#cd5144`), sand, and gold — one
  coherent, earthy set that reads like an expedition field journal, not corporate SaaS.
- **Motifs from a travel journal:** a taped Polaroid hero photo, numbered wax-seal
  badges, dashed "field-note" cards, a topographic contour texture, and a woven top stripe.
- **Motion:** sections fade and rise in on scroll (Framer Motion) over Lenis smooth
  scrolling — all gated behind `prefers-reduced-motion`.
- **Clean on every screen — desktop and mobile alike.** The layout is fully responsive:
  the desktop view is spacious and polished, and on a phone it reflows just as cleanly —
  the hero stacks into a clear vertical story (handwritten scribble → slab headline →
  dashed detail chips → chunky CTA → the taped Polaroid), the nav condenses to the logo
  plus one "Apply to join" button, the form becomes one comfortable column with large tap
  targets, and the wax-seal cards and itinerary rail reflow without crowding. Both views
  are built to look good and be easy to use.

## Tech stack & why

| Choice | Why |
| --- | --- |
| **Next.js 15 (App Router) + React 19 + TypeScript** | One framework gives me a designed frontend *and* a first-class server endpoint (Route Handler) for authoritative validation. TypeScript catches shape bugs before runtime. |
| **Tailwind CSS** | Fast, consistent spacing/type scale from design tokens defined in `tailwind.config.ts` — a deliberate palette, not default framework styling. |
| **Zod** | One schema (`lib/validation.ts`) shared by client and server, so validation can't drift between them. The server is authoritative. |
| **Supabase (Postgres)** | Managed Postgres with an official, parameterized client — no hand-built SQL, no injection surface. Swappable (see `lib/persistence.ts`). |
| **Cloudflare Turnstile** | Free, privacy-friendly CAPTCHA alternative for the public endpoint. Optional and off by default. |
| **Self-hosted fonts** (`@fontsource/*`) | Zilla Slab (slab-serif display + body) + Caveat (handwritten accents) vendored via npm — **zero runtime requests to Google**, which keeps the CSP tight and the page fast. |
| **Vercel** | HTTPS, env-var management, and instant deploys for the serverless route. |

## Project structure

```
app/
  layout.tsx           # fonts, metadata, <html> shell
  page.tsx             # composes the landing sections
  globals.css          # Tailwind + base styles, reduced-motion support
  api/signup/route.ts  # THE endpoint — validation, abuse controls, persistence
components/             # Hero, TripDetails, Itinerary, Highlights, ApplySection,
                        # SignupForm (client), TurnstileWidget (client), Footer, Icons
data/trip.ts           # SINGLE SOURCE OF TRUTH for trip content + mode
lib/
  validation.ts        # shared Zod schema (client + server)
  sanitize.ts          # XSS + control-char + CSV-formula neutralization
  rateLimit.ts         # per-IP fixed-window limiter
  turnstile.ts         # Turnstile verification (enabled only if both keys set)
  persistence.ts       # Supabase insert, with a dev fallback
  tripMode.ts          # open/waitlist/sold_out copy
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (all optional for local dev)
npm run dev                  # http://localhost:3000
```

The app runs **with no configuration** — if Supabase isn't set, a valid submit
is validated + sanitized and logged as a non-PII marker instead of persisted, so
you can demo the full flow immediately.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

### Environment variables

See `.env.example`. Nothing is required to run locally; each block is opt-in.

| Var | Scope | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | DB writes. **Never** prefix `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | Turnstile widget (public) |
| `TURNSTILE_SECRET_KEY` | **server only** | Turnstile verification |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_SECONDS` | server | Per-IP limit (defaults 5 / 600s) |

### Enabling persistence (Supabase)

Create the table, then set the two `SUPABASE_*` vars:

```sql
create table if not exists public.signups (
  id             uuid primary key default gen_random_uuid(),
  trip_slug      text not null,
  full_name      text not null,
  email          text not null,
  phone          text not null,
  emergency_name text not null,
  emergency_phone text not null,
  dietary        text,
  reason         text not null,
  submitted_at   timestamptz not null default now()
);

-- Writes happen ONLY server-side via the service-role key (which bypasses RLS).
-- Turn RLS on and add NO public policies, so the anon/public key can't read or
-- write this table.
alter table public.signups enable row level security;
```

---

## AI Workflow

The brief asks for **at least two different models used at different points**, and
an example of AI output I rejected. Here's the honest delegation.

**Agents & tooling.** The build was driven through an agentic coding tool — Claude's
Cowork agent (a Claude Code–style agent loop) — with **Claude Opus** as the primary
model handling architecture, all code, and the security endpoint. A **separate Claude
Sonnet sub-agent** with fresh context ran the independent security review, so the
reviewer had no memory of writing the code it was critiquing. **ChatGPT / GPT-5** was
used directly in the browser for the design benchmark against the real HXP site and a
cross-provider code review. The table below maps each task to the model running under
the hood and why I delegated it there.

| Stage | Model (under the hood) | Why that model |
| --- | --- | --- |
| Architecture, all code, the security endpoint, iterative fixes, and build/runtime verification | **Claude Opus** (driving via a Claude-Code-style agent) | Frontier reasoning for security-sensitive, multi-file code where correctness and coherence matter most. |
| **Independent adversarial security + code review** of the endpoint and form | **Claude Sonnet** (separate sub-agent, fresh context) | A cheaper, fast model is plenty for a focused review pass — and running it as a *separate* agent with no memory of the build makes it a genuine second opinion, not the author grading their own work. |
| **Design benchmark** — compare the first build against the real HXP site (`destinations.hxp.org`) and pitch a slicker direction + scroll polish | **ChatGPT / GPT-5** (OpenAI, via browser) | A different provider for an independent design critique — pressure-testing the look instead of grading my own taste. Method + prompts: [`docs/chatgpt-prompts.md`](docs/chatgpt-prompts.md). |
| **Design exploration** — three distinct landing-page concepts as standalone HTML mockups, to choose a direction before touching the app | **Claude Opus** (agent) | Fast divergent visual options; cheaper to iterate on throwaway mockups than on the live component tree. |
| **"Crafted" restyle build** — implement the chosen concept across every section + re-verify the production build | **Claude Opus** (agent) | Multi-file, design-system-consistent edits with a build check after each batch. |
| Copy refinement + a **cross-provider** security second opinion | **ChatGPT** (OpenAI free tier) | Different provider = different failure modes; good for prose and for catching what one model family misses. |

**Why split it this way:** the expensive model does the work where a mistake is
costly (auth/validation/secret handling); the cheap model does the bounded,
well-specified job (review against a checklist). Using one model for everything
would have missed the review findings below.

### AI output I rejected / corrected (real examples from this build)

1. **Rejected: Google-hosted fonts.** The first pass wired `next/font/google`. I
   rejected it for two reasons: it adds a third-party origin (`fonts.gstatic.com`)
   to the render path — against the goal of minimizing external origins for a PII
   page — and it failed to build in a locked-down/offline environment. **Fix:**
   vendored the fonts via `@fontsource/*` (self-hosted from npm — the final faces
   are Zilla Slab + Caveat), so there are **zero runtime font requests** and
   `font-src` stays `'self'`.

2. **Corrected by the Sonnet review: a Turnstile lock-out.** My initial
   `verifyTurnstile` skipped verification only when the *secret* was missing. The
   review flagged that a **secret-set-but-site-key-missing** config would render
   no widget yet still demand a token — locking out *every* user. **Fix:**
   Turnstile is now enforced only when **both** keys are present; otherwise it's
   cleanly disabled and honeypot + rate-limiting carry the load.

3. **Corrected: vulnerable dependencies (supply chain).** The initial pin was
   `next@14.2.15`, which npm flagged with a security advisory. Running `npm audit`
   surfaced more across the tree, so I upgraded to **Next 15 + React 19**, bumped
   `@supabase/supabase-js` to a patched release, and used npm `overrides` to force
   patched `postcss` and `sharp` transitively — taking the audit from **6 high to
   0 vulnerabilities**, verified with the endpoint tests still green. (A
   known-vulnerable dependency is exactly what a reviewer greps for.)

4. **Nit, caught in review:** an invalid Tailwind class (`h-4.5`, which isn't in
   the default scale) slipped in and would have silently rendered nothing.
   Corrected to `h-4`.

5. **GPT cross-provider review — what I took and what I didn't.** The ChatGPT
   pass flagged a real bug the others missed: `JSON.parse("null")` (or an array/
   number body) passes the `try/catch`, then `payload.website` throws an
   *uncaught 500*. **Accepted → fixed** with an object guard after parsing. It
   also noted `X-Forwarded-For` is client-spoofable, so the per-IP limiter can be
   farmed unless the app is behind a trusted proxy — **accepted → documented**
   (see Security). On copy I **rejected** its casual headline alternatives ("Come
   build in Vanuatu") in favor of "Build something that lasts," and **rejected**
   cutting the scarcity line since "9 spots left" is real, not manufactured — but
   I **took** its crisper apply-blurb wording. Usefully, GPT also *confirmed* the
   custom-header + Origin/Referer CSRF approach is sound rather than inventing a
   reason to add tokens.

6. **Rejected: the AI's first "slicker" redesign kept the wrong hero.** When I
   asked an agent to make the site more polished, its first pass kept a dark,
   full-bleed photo hero and just layered accents on top — not the light,
   parchment, taped-Polaroid concept I'd picked from the mockups. I rejected it
   and had the agent **fully rewrite the hero** to match the chosen "Crafted"
   concept, then verified it against the mockup with a screenshot before
   continuing. Picking the direction was my call; the model executed it.

The full Sonnet review (findings + what I fixed vs. deferred) is summarized in
the [Security](#security) section.

---

## Security

This form collects real PII, including emergency contacts, so it's built to be
read by a security reviewer.

### Threats considered & mitigations

| Threat | Mitigation (in this codebase) |
| --- | --- |
| **Client-side validation bypass** | The server re-validates *every* field with the same Zod schema (`lib/validation.ts`) in `app/api/signup/route.ts`. Client validation is UX only. |
| **XSS via the free-text field** | `sanitizeFreeText` strips control chars and any tag-shaped content **before storage**; React escapes again on render. Stored data is inert plain text. |
| **SQL/NoSQL injection** | Writes go through the official Supabase client (parameterized). No string-built queries anywhere. |
| **Secret leakage** | Service-role and Turnstile secret keys are server-only env vars; `.env*` is gitignored; `.env.example` ships placeholders only. The one public key is correctly `NEXT_PUBLIC_`. |
| **CSRF** | Endpoint requires a custom `x-hxp-signup` header (a cross-site `<form>` can't set one without a preflight we never allow) **and** a matching `Origin`/`Referer`. It's cookieless, so there's no ambient authority to abuse either. |
| **Spam / abuse** | Honeypot field (silent 200), per-IP fixed-window rate limit, optional Turnstile. Body-size guard (Content-Length + true UTF-8 byte length ≤ 16 KB). Non-JSON rejected early. |
| **PII exposure** | Success response is `{ ok: true }` — no echo. Logs contain only a timestamp + trip slug, never field values. No PII in URLs or client console. |
| **Transport / clickjacking / sniffing** | HSTS, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, a tight `Permissions-Policy`, and a Content-Security-Policy — all in `next.config.js`. `X-Powered-By` removed. |
| **Vulnerable dependencies (supply chain)** | Ran `npm audit`; upgraded Next 14→15 + React 19, patched Supabase, and pinned patched `postcss`/`sharp` via npm `overrides`. Audit is clean: **0 vulnerabilities**. |
| **Spreadsheet formula injection** | `escapeCsvField` is provided for any future CSV/XLSX export of submissions (leading `= + - @` get quoted). |

### What I'd harden next (with more time)

- **Nonce-based CSP.** The CSP currently allows `'unsafe-inline'` on `script-src`
  (required by Next's inline bootstrap without a nonce). A middleware that injects
  a per-request nonce would let me drop `'unsafe-inline'` — the single biggest CSP
  upgrade. Called out as known debt in `next.config.js`. (`'unsafe-eval'` is added
  **only in dev** for Next's Fast Refresh — production `script-src` never includes
  it, which you can confirm in the response headers of the live site.)
- **Distributed rate limiting.** The limiter is an in-memory `Map`, so under
  serverless horizontal scaling the *global* limit is looser than configured and
  resets on redeploy. Move to Upstash Redis / Vercel KV for a real cross-instance
  guarantee. (Honeypot + Turnstile are the stronger controls today.)
- **Trusted client-IP + edge enforcement** *(surfaced by the GPT review)*.
  `X-Forwarded-For` is client-spoofable, so the per-IP limit and the IP handed to
  Turnstile are only as trustworthy as the proxy in front of the origin. Behind
  Vercel's edge with direct origin access blocked this holds; the hardening is to
  derive the IP from a platform-authenticated source and enforce both the body
  cap and the rate limit at the edge/WAF, before the body is buffered.
- **Verified email + double opt-in**, and encryption-at-rest review for the
  emergency-contact fields.
- **Structured audit logging** (submission counts, rejects by reason) without PII.

---

## Round 2 — designed so plausible changes are cheap

All trip content is data in `data/trip.ts`, and UI copy keys off `trip.mode`:

- **"Trip sold out — add a waitlist"** → change `mode: "open"` to `"waitlist"`
  (or `"sold_out"`). The badge, hero CTA, form heading/blurb, submit button, and
  confirmation message all switch automatically via `lib/tripMode.ts`. No markup
  changes.
- **"We added a second trip"** → add another entry to the `trips` record and
  either point `FEATURED_TRIP_SLUG` at it or map the record to a list/route. The
  landing sections already render from a `Trip` object, not hard-coded copy.
- **"Collect one more field"** → add it to the Zod schema + the `FIELDS` array;
  client and server pick it up together.

## Accessibility

Labelled inputs, `aria-invalid` + `aria-describedby` on errors, `role="alert"`
error text, focus-moves-to-first-error on submit, a `role="status"` confirmation
that receives focus, a skip link, visible focus rings, and `prefers-reduced-motion`
support.

## What I cut for the time box

- **Art-directed / owned photography.** The hero uses a single sepia-toned stock
  photo (Unsplash) in a taped-Polaroid frame, and the CSP `img-src` is scoped to
  exactly that one origin (`images.unsplash.com`). Swapping in HXP's own trip
  photography is a drop-in change — and would let me tighten `img-src` back to `'self'`.
- An admin view of submissions (out of scope; the data model + RLS note are ready
  for it).

## What I'd do next

The build is deliberately data-driven (`data/trip.ts` is the single source of truth),
so these are content/direction passes, not rewrites:

1. **Make the trip facts real and accurate.** The dates, price, "what's included /
   not included," and itinerary are representative placeholders. I'd replace them with
   the actual figures for the real trip — verified against HXP's own trip page — so
   nothing on the page overstates or misstates what a Builder is signing up for.

2. **Re-tone the copy toward HXP's mission, not a travel pitch.** Today it leans a
   little toward "come on a cool trip." I'd rewrite the hero, highlights, and itinerary
   to center what a Builder actually *gains*: growing their faith and walking with God,
   serving alongside and building real relationships with the host community, and
   experiencing a new culture first-hand. The service and the people become the
   headline; the destination is the backdrop. That's the shift that makes the page feel
   unmistakably like HXP rather than a generic expedition brand.

3. **Re-run the design pass on the new copy.** The field-note visual system stays; the
   words carry the mission. (Then a fresh accessibility + mobile check on the new content.)

Security hardening I'd prioritize is tracked separately under
[Security → What I'd harden next](#what-id-harden-next-with-more-time).

## Deployment

See [`DEPLOY.md`](DEPLOY.md) for the GitHub + Vercel walkthrough (env vars,
optional Supabase, optional Turnstile).
