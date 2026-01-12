// lib/parseDuration.ts

export function parsePandasTimedeltaToMinutes(input: string): number | null {
  if (!input) return null;

  // Beispiele:
  // "0 days 01:15:00"
  // "1 days 03:05:00"
  const m = input.match(
    /^\s*(\d+)\s+days?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/i
  );

  if (!m) return null;

  const days = Number(m[1]);
  const hours = Number(m[2]);
  const minutes = Number(m[3]);
  const seconds = m[4] ? Number(m[4]) : 0;

  if ([days, hours, minutes, seconds].some(Number.isNaN)) {
    return null;
  }

  return days * 24 * 60 + hours * 60 + minutes + Math.floor(seconds / 60);
}

export function minutesToHHMM(mins: number | null | undefined): string {
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Parses times of day like "6:00", "06:00", or "06:00:30" to minutes since midnight.
// Returns null if the input is invalid.
export function parseHHMMToMinutes(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") {
    // if already numeric minutes, accept directly
    return Number.isFinite(input) ? input : null;
  }
  const s = String(input).trim();
  // Match H:MM or HH:MM with optional :SS
  const m = s.match(/^([0-9]{1,2}):([0-9]{2})(?::([0-9]{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  if ([h, min, sec].some(Number.isNaN)) return null;
  if (h < 0 || h > 23) return null;
  if (min < 0 || min > 59) return null;
  if (sec < 0 || sec > 59) return null;
  return h * 60 + min; // ignore seconds granularity for comparisons
}
