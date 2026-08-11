// =============================================================================
// Cloudflare Turnstile verification (privacy-friendly CAPTCHA alternative).
//
// Enforced ONLY when BOTH keys are configured together:
//   - NEXT_PUBLIC_TURNSTILE_SITE_KEY (client widget)
//   - TURNSTILE_SECRET_KEY           (server verify)
// This avoids two misconfig traps: a secret-without-site-key would render no
// widget yet demand a token (locking everyone out), and a site-key-without-
// secret would imply protection while verifying nothing. If either is missing,
// Turnstile is treated as disabled — honeypot + rate limiting still apply.
// =============================================================================

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
): Promise<boolean> {
  if (!turnstileEnabled()) return true; // disabled -> don't block
  if (!token) return false;

  const body = new URLSearchParams();
  body.append("secret", process.env.TURNSTILE_SECRET_KEY as string);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      // Never let a slow captcha service hang the request forever.
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed
  }
}
