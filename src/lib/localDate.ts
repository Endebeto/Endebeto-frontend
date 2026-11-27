/**
 * P2-22: values for <input type="date"> / <input type="datetime-local">.
 *
 * Those inputs work in the browser's local time, but `toISOString()` is UTC,
 * so between 00:00 and 03:00 in Addis Ababa it returned "yesterday" (and a
 * datetime `min` three hours early). These helpers format local wall time.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" for `date` in the browser's local time zone. */
export function toLocalDateInput(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DDTHH:mm" for `date` in the browser's local time zone. */
export function toLocalDateTimeInput(date: Date = new Date()): string {
  return `${toLocalDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Local calendar date `days` from today (negative for the past). */
export function localDateInputInDays(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toLocalDateInput(d);
}
