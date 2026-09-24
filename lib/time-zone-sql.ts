import "server-only";

import { sql } from "drizzle-orm";

import { APP_TIME_ZONE } from "./time-zone";

// Inlined rather than bound: the same zone appears in several expressions
// that Postgres must see as identical (e.g. GROUP BY and SELECT).
export const appZone = sql.raw(`'${APP_TIME_ZONE}'`);

/** Today's date in APP_TIME_ZONE. */
export const appToday = sql`(now() AT TIME ZONE ${appZone})::date`;
