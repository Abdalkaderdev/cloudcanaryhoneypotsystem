"use client";
import { Frame } from "./Frame";

export function AttackTimeline({ data }: { data: { hours_ago: number; count: number }[] }) {
  // Server returns oldest first (hours_ago: 23) → newest last (hours_ago: 0)
  const ordered = [...data].sort((a, b) => b.hours_ago - a.hours_ago);
  const total = ordered.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...ordered.map((d) => d.count));

  return (
    <Frame index="003" title="24H TIMELINE" meta={`Σ ${total} events · UTC`}>
      <div className="flex items-end gap-[3px] h-44">
        {ordered.map((d, idx) => {
          const hpct = (d.count / max) * 100;
          const live = idx === ordered.length - 1;
          const label = d.hours_ago === 0 ? "NOW" : `-${d.hours_ago}h`;
          return (
            <div key={`${idx}-${d.hours_ago}`} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full bg-bg border border-border h-full relative">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${live ? "bg-threat" : "bg-amber"}`}
                  style={{ height: `${hpct}%`, minHeight: d.count > 0 ? "2px" : 0 }}
                />
                {live && <div className="absolute -top-0.5 left-0 right-0 h-px bg-threat blink" />}
              </div>
              {idx % 4 === 0 && (
                <div className="mt-1.5 text-[9px] tracking-widest2 text-inkLow tabular-nums">
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] tracking-widest2 text-inkLow">
        <span>← -24H</span>
        <span>NOW →</span>
      </div>
    </Frame>
  );
}
