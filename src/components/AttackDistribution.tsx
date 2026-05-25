"use client";
import { attackTypeColor, attackTypeLabel } from "@/lib/utils";
import { Frame } from "./Frame";

export function AttackDistribution({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0]?.[1] || 1;

  return (
    <Frame index="002" title="ATTACK DISTRIBUTION" meta={`Σ ${total} events / 24h`}>
      {entries.length === 0 ? (
        <p className="text-xs tracking-widest2 text-inkMid">// NO SIGNAL</p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([key, value]) => {
            const pct = total ? (value / total) * 100 : 0;
            const w = (value / max) * 100;
            return (
              <li key={key}>
                <div className="flex items-baseline justify-between text-[11px] tracking-widest2">
                  <span className="text-ink uppercase">{attackTypeLabel(key)}</span>
                  <span className="text-inkMid tabular-nums">
                    {String(value).padStart(3, "0")} · {pct.toFixed(0).padStart(2, "0")}%
                  </span>
                </div>
                <div className="mt-1.5 relative h-2 bg-bg border border-border">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${w}%`, background: attackTypeColor(key) }}
                  />
                  {/* tick marks */}
                  <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-r border-borderHi/30 last:border-r-0" />
                    ))}
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
