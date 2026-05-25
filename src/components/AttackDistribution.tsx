"use client";
import { attackTypeColor, attackTypeLabel } from "@/lib/utils";
import { Frame } from "./Frame";

export function AttackDistribution({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0]?.[1] || 1;

  return (
    <Frame
      kicker="Section 02"
      title="By classification"
      byline={total === 0 ? "No traffic observed yet." : `${total} events grouped by detection rule, last 24h.`}
    >
      {entries.length === 0 ? null : (
        <ul className="space-y-3.5">
          {entries.map(([key, value]) => {
            const pct = total ? (value / total) * 100 : 0;
            const w = (value / max) * 100;
            return (
              <li key={key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[16px] text-ink" style={{ fontWeight: 500 }}>
                    {attackTypeLabel(key)}
                  </span>
                  <span className="font-mono text-[12px] text-ink2 lining-nums">
                    {value.toLocaleString()} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 relative h-[3px] bg-paper3">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${w}%`, background: attackTypeColor(key) }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Frame>
  );
}
