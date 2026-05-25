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
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
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
      // day-of-year as issue number, romanised
      const start = Date.UTC(d.getUTCFullYear(), 0, 0);
      const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
      const doy = Math.floor(diff / (1000 * 60 * 60 * 24));
      setIssueNo(romanise(doy));
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const statusDot = status === "active" ? "bg-ink" : status === "degraded" ? "bg-gold" : "bg-burgundy";
  const statusLabel = status === "active" ? "All Stations Operational" : status === "degraded" ? "Partial Service" : "Off the Wire";

  return (
    <header>
      {/* Top meta strip */}
      <div className="mx-auto max-w-5xl px-6 pt-6 pb-3 flex items-center justify-between text-[10px] text-ink2">
        <span className="smallcaps">Vol. I · No. {issueNo || "—"}</span>
        <span className="byline text-ink2 italic">{date} — {time}</span>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot} pulse-live`} aria-hidden />
          <span className="smallcaps">{statusLabel}</span>
        </span>
      </div>

      <div className="hr-double" />

      {/* Masthead */}
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16 text-center">
        <div className="smallcaps text-ink3 mb-4">— A Daily Record of Adversary Activity —</div>
        <h1
          className="font-display text-ink leading-[0.92]"
          style={{ fontSize: "clamp(64px, 10vw, 144px)", fontWeight: 900, letterSpacing: "-0.018em", fontVariationSettings: "'opsz' 96" }}
        >
          The <span className="italic" style={{ fontWeight: 400 }}>Threat</span> Briefing
        </h1>
        <div className="ornament mt-8" aria-hidden><span className="ornament-mark" /></div>
        <p className="byline mt-2 max-w-xl mx-auto" style={{ fontSize: "15px" }}>
          Observations collected by the Cloud Canary honeypot —
          a deliberately vulnerable surface deployed to study what knocks on closed doors.
        </p>
      </div>

      <div className="hr-strong" />

      {/* Folio strip */}
      <div className="mx-auto max-w-5xl px-6 py-2 flex items-center justify-between text-[10px] text-ink3">
        <span className="smallcaps">{date.toUpperCase()}</span>
        <span className="byline italic" style={{ fontSize: "11px" }}>Compiled live · /decoy/* under continuous observation</span>
        <span className="smallcaps">Page I</span>
      </div>
      <div className="hr-soft" />
    </header>
  );
}
