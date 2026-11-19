const WEEKDAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Converts a Date into a YYYY-MM-DD key used throughout the app. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses a YYYY-MM-DD key back into a local Date. */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Returns today's date as a YYYY-MM-DD key. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Shifts a date key forward or backward by the given number of days. */
export function shiftDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Returns the short weekday label for a date key (e.g. "WED"). */
export function weekdayShort(dateKey: string): string {
  return WEEKDAYS_SHORT[parseDateKey(dateKey).getDay()];
}

/** Returns the full weekday name for a date key (e.g. "Wednesday"). */
export function weekdayLong(dateKey: string): string {
  return WEEKDAYS_LONG[parseDateKey(dateKey).getDay()];
}

/** Returns the full month name for a date key (e.g. "November"). */
export function monthLong(dateKey: string): string {
  return MONTHS_LONG[parseDateKey(dateKey).getMonth()];
}

/** Returns the day of month as a two-digit string (e.g. "18"). */
export function dayNumber(dateKey: string): string {
  return String(parseDateKey(dateKey).getDate()).padStart(2, "0");
}

/** Formats a date key as a long display string (e.g. "November 18, 2026"). */
export function formatLongDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${MONTHS_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Returns a friendly day label: "Today", "Yesterday", or the weekday name. */
export function dayLabel(dateKey: string, today = todayKey()): string {
  if (dateKey === today) return "Today";
  const yesterday = shiftDateKey(today, -1);
  if (dateKey === yesterday) return "Yesterday";
  return weekdayLong(dateKey);
}

/** Returns a list of recent date keys ending at `from` (default: today, last 7 days). */
export function recentDateKeys(count = 7, from = todayKey()): string[] {
  return Array.from({ length: count }, (_, index) => shiftDateKey(from, -index));
}
