"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { attackTypeColor, attackTypeLabel } from "@/lib/utils";
import { Frame } from "./Frame";

export function AttackDistribution({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const data = entries.map(([key, value]) => ({
    key, name: attackTypeLabel(key), value, color: attackTypeColor(key)
  }));

  return (
    <Frame
      kicker="No. V"
      title="A taxonomy of intrusions"
      byline={total === 0 ? "No interactions recorded yet." : `${total.toLocaleString()} events, grouped by detection rule.`}
    >
      {entries.length === 0 ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={84}
                  paddingAngle={1}
                  stroke="#F8F4ED"
                  strokeWidth={2}
                >
                  {data.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#F8F4ED",
                    border: "1px solid #0E0C0A",
                    borderRadius: 0,
                    fontFamily: "Crimson Pro, serif",
                    fontSize: 13,
                    color: "#0E0C0A"
                  }}
                  formatter={(v: number) => [`${v.toLocaleString()} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.map((d) => {
              const pct = total ? (d.value / total) * 100 : 0;
              return (
                <li key={d.key} className="flex items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="inline-block h-2 w-2 mt-1 flex-shrink-0" style={{ background: d.color }} aria-hidden />
                    <span className="font-display text-ink truncate" style={{ fontSize: "14px", fontWeight: 500 }}>{d.name}</span>
                  </span>
                  <span className="font-mono text-[11px] text-ink2 lining-nums whitespace-nowrap">
                    {d.value.toLocaleString()} · {pct.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Frame>
  );
}
