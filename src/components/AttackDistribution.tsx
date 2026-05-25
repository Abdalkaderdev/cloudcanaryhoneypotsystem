"use client";
import { attackTypeColor, attackTypeLabel } from "@/lib/utils";
import { Frame } from "./Frame";

export function AttackDistribution({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0]?.[1] || 1;

  return (
    <Frame
      kicker="No. II"
      title="A taxonomy of intrusions"
      byline={total === 0 ? "The taxonomy awaits its first specimen." : `${total.toLocaleString()} interactions, grouped by detection rule.`}
    >
      {entries.length === 0 ? null : (
        <ul className="space-y-5">
          {entries.map(([key, value]) => {
            const pct = total ? (value / total) * 100 : 0;
            const w = (value / max) * 100;
            return (
              <li key={key} className="grid grid-cols-[1fr_auto] gap-x-6 items-baseline">
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-ink" style={{ fontSize: "17px", fontWeight: 500 }}>
                      {attackTypeLabel(key)}
                    </span>
                    <span className="font-mono text-[11px] text-ink2 lining-nums">
                      {value.toLocaleString()} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 relative h-px bg-rule">
                    <div
                      className="absolute inset-y-0 left-0 h-px"
                      style={{ width: `${w}%`, background: attackTypeColor(key) }}
                    />
                    <div
                      className="absolute -top-[2px] h-[5px] w-[5px]"
                      style={{ left: `calc(${w}% - 2.5px)`, background: attackTypeColor(key), transform: "rotate(45deg)" }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Frame>
  );
}
