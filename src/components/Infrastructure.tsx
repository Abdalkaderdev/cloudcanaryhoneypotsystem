import { Frame } from "./Frame";

export function Infrastructure({ items }: { items: { name: string; status: "ok" | "warn" | "down" }[] }) {
  return (
    <Frame kicker="No. VIII" title="On the watch" byline="State of every component in the observation chain.">
      <ul className="space-y-0">
        {items.map((it) => {
          const tone =
            it.status === "ok" ? "text-ink2" :
            it.status === "warn" ? "text-gold" : "text-burgundy";
          const label = it.status === "ok" ? "Operational" : it.status === "warn" ? "Degraded" : "Off line";
          const dot =
            it.status === "ok" ? "bg-ink" :
            it.status === "warn" ? "bg-gold" : "bg-burgundy";
          return (
            <li key={it.name} className="flex items-baseline justify-between py-2.5 border-b border-rule/60 last:border-0">
              <span className="font-display text-ink" style={{ fontSize: "15px", fontWeight: 500 }}>{it.name}</span>
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dot} ${it.status !== "ok" ? "pulse-live" : ""}`} aria-hidden />
                <span className={`smallcaps ${tone}`}>{label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
