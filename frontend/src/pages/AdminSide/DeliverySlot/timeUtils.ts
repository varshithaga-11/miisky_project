/** Convert a Date from Flatpickr to `HH:MM:SS` for Django TimeField. */
export function dateTo24hTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Parse API time (`08:00:00` or with fractional seconds) into a Date (today’s calendar date, chosen time). */
export function backendTimeToDate(t: string | null | undefined): Date | undefined {
  if (!t) return undefined;
  const parts = t.split(/[:.]/);
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
}

/** Stable `HH:MM:SS` string from API for form state / submit when user does not touch the picker. */
export function normalizeBackendTime(t: string | null | undefined): string {
  if (!t) return "";
  const d = backendTimeToDate(t);
  return d ? dateTo24hTimeString(d) : "";
}

/** Table display: 12-hour clock. */
export function formatTime12hDisplay(v: string | null | undefined): string {
  if (!v) return "—";
  const d = backendTimeToDate(v);
  if (!d) return "—";
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
