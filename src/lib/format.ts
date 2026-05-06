export type TargetClass = "9" | "10" | "9_10";

export function formatTargetClass(c: TargetClass): string {
  if (c === "9_10") return "Class 9 & 10";
  return `Class ${c}`;
}

export function targetClassMatches(sessionClass: TargetClass, studentClass: "9" | "10"): boolean {
  return sessionClass === studentClass || sessionClass === "9_10";
}

// ─── Datetime helpers for admin <input type="datetime-local"> ──────────────
// All session deadlines are entered in IST by Indian admins. We store as UTC
// in Postgres (timestamptz). The HTML datetime-local input has no timezone,
// so we manually convert in both directions to keep IST wall-clock.

const IST_OFFSET_MIN = 5 * 60 + 30; // 330

/** Convert a UTC Date (or ISO string) to "YYYY-MM-DDTHH:MM" wall-clock in IST,
 * suitable for prefilling an `<input type="datetime-local">`. */
export function utcToIstLocalInput(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return null;
  // Shift forwards by IST offset, then read out UTC components — that gives
  // us the IST wall-clock components.
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mi = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Parse "YYYY-MM-DDTHH:MM[:SS]" treated as IST wall-clock → real UTC Date.
 * Used in server actions when persisting datetime-local input values. */
export function istLocalInputToUtc(value: string | null | undefined): Date | null {
  if (!value) return null;
  // Make sure seconds are present so Date constructor accepts it
  const withSeconds = /:\d{2}:\d{2}$/.test(value) ? value : `${value}:00`;
  // Append IST offset and let Date parse it
  const d = new Date(`${withSeconds}+05:30`);
  return isNaN(d.getTime()) ? null : d;
}
