export type TargetClass = "9" | "10" | "9_10" | "11_12";

export function formatTargetClass(c: TargetClass): string {
  if (c === "9_10") return "Class 9 & 10";
  if (c === "11_12") return "Class 11 & 12";
  return `Class ${c}`;
}

export function targetClassMatches(
  sessionClass: TargetClass,
  studentClass: "9" | "10" | "11" | "12"
): boolean {
  if (sessionClass === studentClass) return true;
  if (sessionClass === "9_10") return studentClass === "9" || studentClass === "10";
  if (sessionClass === "11_12") return studentClass === "11" || studentClass === "12";
  return false;
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

// ─── Internship date cutoff helpers ────────────────────────────────────────
// "Cutoff" = stop accepting registrations N days before each internship date.

/** Format a UTC Date as IST wall-clock "YYYY-MM-DD HH:MM:SS" — used for CSV exports */
export function formatIstForCsv(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mi = String(shifted.getUTCMinutes()).padStart(2, "0");
  const ss = String(shifted.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/** Is this internship date still open for registration today? */
export function isDateOpen(internshipDate: string | Date, cutoffDays: number): boolean {
  const d = typeof internshipDate === "string" ? new Date(internshipDate) : internshipDate;
  if (isNaN(d.getTime())) return true;
  const cutoff = new Date(d.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
  return Date.now() < cutoff.getTime();
}

/** Is at least one of these internship dates still open? */
export function anyDateOpen(
  dates: (string | Date)[] | null | undefined,
  cutoffDays: number
): boolean {
  // No dates = treat as always open (admin hasn't pinned a date yet)
  if (!dates || dates.length === 0) return true;
  return dates.some((d) => isDateOpen(d, cutoffDays));
}

/** Slugify a string for use in URLs. Lowercases, replaces non-alnum runs
 * with '-', trims leading/trailing hyphens, caps length. */
export function slugify(input: string, max = 40): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/^-+|-+$/g, "");
  return s || "session";
}

/** Today's date in IST in YYYY-MM-DD form. */
function todayIstYmd(): string {
  // en-CA gives YYYY-MM-DD
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Has this specific internship date already passed (i.e. it's the next day or
 * later in IST)? Used to decide if a (company, date) slot is open for feedback. */
export function isDatePastIst(d: string | Date | null | undefined): boolean {
  if (!d) return false;
  const ymd =
    typeof d === "string"
      ? d.slice(0, 10)
      : d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return ymd < todayIstYmd();
}

/** Has every date for this internship already passed (used to decide if it's
 * eligible for feedback)? Returns false if no dates set (we don't know yet). */
export function isInternshipOver(
  dates: (string | Date)[] | null | undefined
): boolean {
  if (!dates || dates.length === 0) return false;
  return dates.every((d) => isDatePastIst(d));
}
