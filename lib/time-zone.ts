/** The business's time zone: days and weeks are counted in it. */
export const APP_TIME_ZONE = "Asia/Kolkata";

// en-CA formats as YYYY-MM-DD.
const appDate = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE });

/** The calendar date of `date` in APP_TIME_ZONE, as YYYY-MM-DD. */
export function toAppDate(date: Date) {
  return appDate.format(date);
}
