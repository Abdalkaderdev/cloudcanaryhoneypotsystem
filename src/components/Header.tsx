"use client";
import { useEffect, useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function romanise(n: number): string {
  if (n <= 0 || n > 3999) return String(n);
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let out = "";
  for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
  return out;
}

export function Header({ status }: { status: "active" | "degraded" | "down" }) {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [issueNo, setIssueNo] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setDate(`${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`);
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`);
      const start = Date.UTC(d.getUTCFullYear(), 0, 0);
      const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
      const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
      setIssueNo(romanise(doy));
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const statusDot =
    status === "active"   ? "bg-ink" :
    status === "degraded" ? "bg-gold" :
                            "bg-burgundy";
  const statusLabel =
    status === "active"   ? "Operational" :
    status === "degraded" ? "Degraded" :
                            "Offline";

  return (
    <header>
      {/* Top meta strip */}
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-2 flex items-center justify-between text-[10px] text-ink2">
        <span className="smallcaps">Vol. I · No. {issueNo || "—"}</span>
        <span className="byline italic">{date} — {time}</span>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot} pulse-live`} aria-hidden />
          <span className="smallcaps">{statusLabel}</span>
        </span>
      </div>

      <div className="hr-double" />

      {/* Compact masthead */}
      <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8 flex items-end justify-between gap-6">
        <div>
          <div className="smallcaps text-ink3 mb-2">A daily record of adversary activity</div>
          <h1
            className="font-display text-ink leading-[0.9]"
            style={{ fontSize: "clamp(40px, 6.5vw, 72px)", fontWeight: 900, letterSpacing: "-0.02em", fontVariationSettings: "'opsz' 96" }}
          >
            The <span className="italic" style={{ fontWeight: 400 }}>Threat</span> Briefing
          </h1>
        </div>
        <div className="hidden md:block text-right max-w-sm">
          <p className="byline" style={{ fontSize: "13px" }}>
            Compiled live from the Cloud Canary honeypot — a deliberately vulnerable surface
            deployed to study what knocks on closed doors.
          </p>
        </div>
      </div>

      <div className="hr-strong" />

      <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between text-[10px] text-ink3">
        <span className="smallcaps">{date.toUpperCase()}</span>
        <span className="byline italic" style={{ fontSize: "11px" }}>/decoy/* under continuous observation</span>
        <span className="smallcaps">Page I</span>
      </div>
      <div className="hr-soft" />
    </header>
  );
}
