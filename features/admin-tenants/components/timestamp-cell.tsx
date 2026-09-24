import { daysAgoLabel, displayDate } from "../utils/activity-dates";

type TimestampCellProps = {
  timestamp: string | null;
  /** Reference time for "days ago", so server and client agree. */
  now: string;
  emptyLabel: string;
};

/** "3 days ago" over the date, or `emptyLabel` when there's no timestamp. */
export function TimestampCell({ timestamp, now, emptyLabel }: TimestampCellProps) {
  if (!timestamp) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <>
      <p>{daysAgoLabel(timestamp, now)}</p>
      <p className="text-xs text-muted-foreground">
        {displayDate.format(new Date(timestamp))}
      </p>
    </>
  );
}
