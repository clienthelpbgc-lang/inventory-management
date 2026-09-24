import { APP_TIME_ZONE, toAppDate } from "@/lib/time-zone";

// A fixed zone (not the viewer's) so server and client render identical
// dates, with no hydration mismatch.
const TIME_ZONE = APP_TIME_ZONE;

export const DAY_MS = 24 * 60 * 60 * 1000;

export const displayDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

// Week starts arrive as bare YYYY-MM-DD dates, so format them in UTC to keep
// the day unshifted.
const weekStartDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function daysAgoLabel(timestamp: string, now: string) {
  // Date.parse reads YYYY-MM-DD as UTC midnight, so this is whole days.
  const days =
    (Date.parse(toAppDate(new Date(now))) -
      Date.parse(toAppDate(new Date(timestamp)))) /
    DAY_MS;

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function formatWeekStart(weekStart: string) {
  return weekStartDate.format(new Date(weekStart));
}

/**
 * The postgres-js driver leaves timestamps as Postgres-formatted strings in
 * raw queries (e.g. "2026-09-23 06:51:30.078+00"); normalize them to ISO.
 */
export function toIsoString(timestamp: string | null) {
  return timestamp ? new Date(timestamp).toISOString() : null;
}
