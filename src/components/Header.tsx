"use client";
import { useEffect, useState } from "react";

export function Header({ status }: { status: "active" | "degraded" | "down" }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())} · ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
    };
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(t);
  }, []);

  const statusColor = status === "active" ? "text-ok" : status === "degraded" ? "text-warn" : "text-threat";
  const statusLabel = status === "active" ? "OPERATIONAL" : status === "degraded" ? "DEGRADED" : "OFFLINE";

  return (
    <header className="border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-baseline gap-4">
          <div className="font-display text-2xl font-black tracking-widest2 text-amber leading-none">
            CLOUD&nbsp;CANARY
          </div>
          <div className="text-[10px] tracking-widest2 text-inkLow uppercase hidden sm:block">
            OBSERVATION TERMINAL · v1.0
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-widest2 text-inkMid">
            <span className="text-inkLow">SESSION</span>
            <span className="text-ink font-mono">{now || "—"}</span>
          </div>
          <div className="flex items-center gap-2 border border-border px-3 py-1.5">
            <span className={`inline-block h-1.5 w-1.5 ${status === "active" ? "bg-ok" : status === "degraded" ? "bg-warn" : "bg-threat"} blink`} aria-hidden />
            <span className="text-[10px] tracking-widest2 text-inkMid">STATUS</span>
            <span className={`text-[10px] tracking-widest2 font-bold ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-2">
        <div className="text-[10px] tracking-widest2 text-inkLow">
          // PASSIVE OBSERVATION OF DECOY ENDPOINTS · ALL TRAFFIC IS UNTRUSTED · DO NOT INTERACT
        </div>
      </div>
    </header>
  );
}
