import { timeAgo } from "@/lib/utils";
import { Frame } from "./Frame";

export function TopAttackers({ items }: { items: { ip: string; count: number; country?: string; last: number }[] }) {
  return (
    <Frame index="006" title="TOP THREAT SOURCES" meta="ranked by hit count">
      {items.length === 0 ? (
        <p className="text-[11px] tracking-widest2 text-inkMid">// NO HOSTILE SOURCES OBSERVED</p>
      ) : (
        <ol className="space-y-2">
          {items.map((a, i) => (
            <li key={a.ip} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border border-border px-3 py-2">
              <span className="text-[12px] tracking-widest2 text-amber font-bold tabular-nums">
                [{String(i + 1).padStart(2, "0")}]
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[12px] text-ink truncate">{a.ip}</div>
                <div className="text-[10px] tracking-widest2 text-inkMid uppercase truncate">
                  {a.country || "UNKNOWN ORIGIN"} · LAST {timeAgo(a.last).toUpperCase()}
                </div>
              </div>
              <span className="border border-border px-2 py-0.5 text-[11px] text-amber tabular-nums">
                {String(a.count).padStart(3, "0")} HITS
              </span>
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}
