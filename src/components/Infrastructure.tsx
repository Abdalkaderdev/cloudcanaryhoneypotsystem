import { Frame } from "./Frame";

export function Infrastructure({ items }: { items: { name: string; status: "ok" | "warn" | "down" }[] }) {
  return (
    <Frame kicker="Section 05" title="System status">
      <ul className="space-y-2.5">
        {items.map((it) => {
          const tone =
            it.status === "ok" ? "text-moss" :
            it.status === "warn" ? "text-ochre" : "text-red";
          const label = it.status === "ok" ? "Operational" : it.status === "warn" ? "Degraded" : "Down";
          const dot =
            it.status === "ok" ? "bg-moss" :
            it.status === "warn" ? "bg-ochre" : "bg-red";
          return (
            <li key={it.name} className="flex items-baseline justify-between py-2 border-b border-rule/50 last:border-0">
              <span className="font-display text-ink" style={{ fontWeight: 500 }}>{it.name}</span>
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
