# Deploy guide

Get the site live on Vercel in ~10 minutes. It works with **no** configuration;
Supabase and Turnstile are optional upgrades.

## 0. Prerequisites

- A **GitHub** account and a **Vercel** account (free tier is fine).
- Optional: a **Supabase** project (to persist submissions) and a **Cloudflare
  Turnstile** widget (to gate the endpoint).

## 1. Push to GitHub

From inside `scenario-2-microsite/`:

```bash
git init
git add .
git commit -m "HXP Vanuatu trip sign-up microsite"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

**Before you push, confirm no secrets are staged:**

```bash
git ls-files | grep -E '\.env' || echo "OK: no .env files tracked"
```

Only `.env.example` should ever appear. `.env.local` is gitignored.

## 2. Deploy on Vercel

1. Go to **vercel.com/new** and **import** your GitHub repo.
2. Vercel auto-detects **Next.js** — no settings to change.
3. Click **Deploy**. You'll get a live `https://<project>.vercel.app` URL.

That URL already works: submissions are validated + sanitized and logged as a
non-PII marker (no database yet).

## 3. (Optional) Persist to Supabase

1. Create a Supabase project. In the SQL editor, run the `create table` +
   `enable row level security` block from the [README](README.md#enabling-persistence-supabase).
2. In **Vercel → Project → Settings → Environment Variables**, add (Production +
   Preview):
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the **service role** key (Settings → API)
3. **Redeploy** (Deployments → ⋯ → Redeploy). Submissions now land in `signups`.

> The service-role key is server-only and bypasses RLS. Keep RLS **on** with no
> public policies so the anon key can't touch the table.

## 4. (Optional) Turn on Turnstile

1. Cloudflare dashboard → **Turnstile** → add a widget for your Vercel domain.
2. Add **both** env vars in Vercel and redeploy:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public)
   - `TURNSTILE_SECRET_KEY` (secret)

The widget renders and the server verifies only when **both** are set.

## 5. Verify

- Load the site on a **phone** — the layout is designed mobile-first.
- Submit the form → you should see the confirmation state.
- If Supabase is on, confirm a row appeared.
- Check headers: `curl -sI https://<your-url>/ | grep -i content-security-policy`.

---

## Round 2 — the 1-hour change request

**Send HXP 2–3 one-hour slots** in the next few days. Fill these in:

- Slot A: Thursday, Aug 13 — 9:00–10:00 AM MT
- Slot B: Thursday, Aug 13 — 12:00–1:00 PM MT
- Slot C: Thursday, Aug 13 — 3:00–4:00 PM MT
- (Flexible all day Thursday, Aug 13, Mountain Time — happy to take another window.)

**When the change request arrives, here's where it lives:**

| Likely request | Where you change it |
| --- | --- |
| Trip sold out / add waitlist | `data/trip.ts` → `mode`. Copy adapts via `lib/tripMode.ts`. |
| Add a second trip | Add an entry to `trips` in `data/trip.ts`; point `FEATURED_TRIP_SLUG` or render the record as a list. |
| New form field | `lib/validation.ts` (schema) + `components/SignupForm.tsx` (`FIELDS`) + the Supabase table. |
| Capacity / spots counter | `data/trip.ts` → `capacity`, `spotsRemaining`. |

Use AI for Round 2 too, and note in the commit message which model you used and
why (e.g., "Claude Code / Opus for the schema + endpoint change; verified build").
