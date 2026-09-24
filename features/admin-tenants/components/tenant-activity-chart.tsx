"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TenantDetail } from "../types/tenant-detail.type";
import { formatWeekStart } from "../utils/activity-dates";

// blue-600: passes contrast against the white card surface.
const BAR_COLOR = "#2563eb";
const GRID_COLOR = "#e5e7eb";
const AXIS_TEXT_COLOR = "#6b7280";
const HOVER_BAND_COLOR = "#f1f5f9";

type ChartDatum = { label: string; count: number };

type TenantActivityChartProps = {
  weeklyTransactions: TenantDetail["weeklyTransactions"];
};

export function TenantActivityChart({ weeklyTransactions }: TenantActivityChartProps) {
  if (weeklyTransactions.every((week) => week.count === 0)) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No transactions in the last {weeklyTransactions.length} weeks.
      </p>
    );
  }

  const data: ChartDatum[] = weeklyTransactions.map((week) => ({
    label: formatWeekStart(week.weekStart),
    count: week.count,
  }));

  return (
    <>
      <div className="h-64" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
              width={32}
            />

            <Tooltip
              cursor={{ fill: HOVER_BAND_COLOR }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const datum = payload[0].payload as ChartDatum;

                return (
                  <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-md">
                    <p className="text-muted-foreground">Week of {datum.label}</p>
                    <p className="font-semibold text-slate-900">
                      {datum.count} {datum.count === 1 ? "transaction" : "transactions"}
                    </p>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="count"
              fill={BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Transactions per week</caption>
        <thead>
          <tr>
            <th>Week of</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <td>{datum.label}</td>
              <td>{datum.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
