// Simple, no-infra bot defences for public forms.
//
// Two checks, both cheap:
//   1. HONEYPOT — a hidden input real users never see or fill. Bots that
//      naively populate every field will give themselves away.
//   2. TIMING — the client stamps a render timestamp into a hidden input
//      via useEffect. A real human takes several seconds to fill a form;
//      naive scripts POST within milliseconds, and non-JS clients leave
//      the field at "0".
//
// Both run server-side (don't trust the browser to enforce). On detection
// we return a silent success — the bot thinks the submission worked and
// doesn't adapt its payload, while nothing gets written to the DB.

export const BOT_HONEYPOT_FIELD = "website_url";
export const BOT_TIMING_FIELD = "form_rendered_at";

// Minimum render-to-submit gap. Humans typing a 7-field form take at
// least this long; scripts don't.
const MIN_RENDER_TO_SUBMIT_MS = 2500;

export type BotCheckResult =
  | { ok: true }
  | { ok: false; reason: "honeypot" | "timing" | "missing_timing" };

export function detectBotSubmission(formData: FormData): BotCheckResult {
  const honeypot = formData.get(BOT_HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }

  const rendered = formData.get(BOT_TIMING_FIELD);
  if (typeof rendered !== "string" || rendered.length === 0) {
    return { ok: false, reason: "missing_timing" };
  }

  const renderedAt = Number(rendered);
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) {
    return { ok: false, reason: "timing" };
  }

  const elapsed = Date.now() - renderedAt;
  if (elapsed < MIN_RENDER_TO_SUBMIT_MS) {
    return { ok: false, reason: "timing" };
  }

  return { ok: true };
}
