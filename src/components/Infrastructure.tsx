import { Frame } from "./Frame";

export function Infrastructure({ items }: { items: { name: string; status: "ok" | "warn" | "down" }[] }) {
  return (
    <Frame index="005" title="INFRA STATUS" meta={`${items.length} components`}>
      <ul className="space-y-2">
        {items.map((it) => {
          const tone =
            it.status === "ok" ? "text-ok" :
            it.status === "warn" ? "text-warn" : "text-threat";
          const label = it.status === "ok" ? "OPERATIONAL" : it.status === "warn" ? "DEGRADED" : "DOWN";
          const dot =
            it.status === "ok" ? "bg-ok" :
            it.status === "warn" ? "bg-warn" : "bg-threat";
          return (
            <li key={it.name} className="flex items-center justify-between border border-border px-3 py-2">
              <div className="flex items-center gap-3">
                <span className={`h-1.5 w-1.5 ${dot} ${it.status !== "ok" ? "blink" : ""}`} aria-hidden />
                <span className="text-[12px] tracking-widest2 text-ink uppercase">{it.name}</span>
              </div>
              <span className={`text-[10px] tracking-widest2 ${tone}`}>● {label}</span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
