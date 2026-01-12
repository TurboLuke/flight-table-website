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
