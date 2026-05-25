import { timeAgo } from "@/lib/utils";
import { Frame } from "./Frame";

export function TopAttackers({ items }: { items: { ip: string; count: number; country?: string; last: number }[] }) {
  return (
    <Frame kicker="No. VI" title="Frequent callers" byline="The ten most persistent sources observed during this watch.">
      {items.length === 0 ? (
        <p className="byline italic">None observed yet.</p>
      ) : (
        <ol className="space-y-0">
          {items.map((a, i) => (
            <li key={a.ip} className="grid grid-cols-[40px_1fr_auto] items-baseline gap-4 py-3 border-b border-rule/60 last:border-0">
              <span
                className="font-display italic text-burgundy lining-nums"
                style={{ fontWeight: 700, fontSize: "26px", letterSpacing: "-0.02em" }}
              >
                {i + 1}.
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[13px] text-ink lining-nums truncate">{a.ip}</div>
                <div className="byline truncate">
                  {a.country || "Unknown origin"} · last seen {timeAgo(a.last)}
                </div>
              </div>
              <span className="font-display text-ink lining-nums" style={{ fontSize: "20px", fontWeight: 500 }}>
                {a.count.toLocaleString()}
                <span className="byline ml-1" style={{ fontSize: "13px" }}> interactions</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}
