# ChatGPT (GPT-5) prompt pack

The build was done with Claude (Opus for code, a Sonnet sub-agent for the
security review). Running these two prompts in **ChatGPT** adds a genuine
**cross-provider** model to the workflow — which is the strongest read of the
"use at least two different AI models" requirement. Paste the results back and
we'll fold in the good parts and note one thing GPT suggested that we rejected.

Total time: ~10 minutes.

---

## Prompt 1 — Landing copy refinement (design/voice)

> You are a senior brand copywriter for a humanitarian travel org (HXP) that runs
> hands-on building expeditions. Audience: first-time volunteers, 20s–40s,
> browsing on a phone, a little nervous about committing. Voice: warm, grounded,
> specific, not salesy or "voluntourism-y."
>
> Here is my current hero + section copy for a Vanuatu build-expedition landing
> page:
>
> - Hero headline: "Build something that lasts in Vanuatu."
> - Hero subhead: "Twelve days building alongside an island community in the South Pacific."
> - Apply section title: "Claim your spot"
> - Apply blurb: "Tell us a little about yourself. It takes two minutes, and a real person from our Builder Experience team reads every application."
>
> Give me: (a) 3 alternative hero headlines + subheads, each with a one-line note
> on the angle it takes; (b) a tighter apply-section blurb; (c) one thing in my
> current copy you'd cut and why. Keep it mobile-first — headlines under ~45
> characters where possible.

**What to do with the output:** pick the best headline/blurb (or keep mine),
edit `data/trip.ts` (`tagline`) and `lib/tripMode.ts` (`formTitle`, `formBlurb`)
or the `Hero.tsx` headline. Note in your README which suggestion you used and one
you rejected.

---

## Prompt 2 — Cross-provider security second opinion

> You are an application-security reviewer. Below is the server route handler for
> a public sign-up form that collects PII (Next.js App Router, TypeScript). It
> already does: shared Zod validation client+server, HTML/control-char
> sanitization of free text before storage, a parameterized Supabase insert, a
> honeypot, per-IP in-memory rate limiting, optional Cloudflare Turnstile, an
> `x-hxp-signup` custom-header + Origin/Referer CSRF check, a 16 KB body cap, and
> security headers (CSP, HSTS, X-Frame-Options, nosniff) set elsewhere.
>
> Find real weaknesses only — no boilerplate. For each: severity, the exact risk,
> and a concrete fix. Then tell me the single highest-value change.
>
> [paste the contents of `app/api/signup/route.ts` here]

**What to do with the output:** compare GPT's findings to the Claude Sonnet
review already summarized in the README. Anything new and valid, fix it and add a
line to the README's "AI output I corrected" list attributing it to GPT-5.
Anything you disagree with, note why you rejected it — that judgment is part of
what's being graded.

---

## After you run them

Update the README **AI Workflow** table so the GPT-5 row reads as *done* (not
"prepped"), and make sure at least one rejected/corrected example is attributed to
GPT-5. That gives you a clean, truthful three-model story: Claude Opus (build) →
Claude Sonnet (independent review) → GPT-5 (copy + cross-provider review).
