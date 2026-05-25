import { timeAgo } from "@/lib/utils";
import { Frame } from "./Frame";

export function TopAttackers({ items }: { items: { ip: string; count: number; country?: string; last: number }[] }) {
  return (
    <Frame kicker="Section 06" title="Frequent visitors" byline="Ranked by total request count over the observation window.">
      {items.length === 0 ? (
        <p className="byline italic">No hostile sources observed yet.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((a, i) => (
            <li key={a.ip} className="grid grid-cols-[32px_1fr_auto] items-baseline gap-3 py-2 border-b border-rule/50 last:border-0">
              <span className="font-display italic text-red text-[20px] lining-nums" style={{ fontWeight: 700 }}>
                {i + 1}.
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[14px] text-ink lining-nums truncate">{a.ip}</div>
                <div className="byline truncate">
                  {a.country || "Unknown origin"} · last seen {timeAgo(a.last)}
                </div>
              </div>
              <span className="font-display text-ink lining-nums" style={{ fontWeight: 700 }}>
                {a.count.toLocaleString()}<span className="text-ink3 italic font-normal text-[12px]"> hits</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}
