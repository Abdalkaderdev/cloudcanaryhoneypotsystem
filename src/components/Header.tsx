"use client";
import { useEffect, useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function Header({ status }: { status: "active" | "degraded" | "down" }) {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setDate(`${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`);
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const statusColor = status === "active" ? "bg-moss" : status === "degraded" ? "bg-ochre" : "bg-red";
  const statusLabel = status === "active" ? "Active" : status === "degraded" ? "Degraded" : "Offline";

  return (
    <header>
      <div className="hr-thick" />
      <div className="mx-auto max-w-6xl px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-ink2">
        <span className="smallcaps">Cloud Canary · Vol. I · No. 1</span>
        <span className="hidden sm:inline italic">{date} — {time}</span>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${statusColor} pulse-live`} aria-hidden />
          <span className="smallcaps">System {statusLabel}</span>
        </span>
      </div>
      <div className="hr-soft" />
      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 text-center">
        <h1 className="font-display text-ink leading-[0.92]" style={{ fontSize: "clamp(56px, 9vw, 116px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
          The Threat <span className="italic font-700">Briefing</span>
        </h1>
        <p className="byline mt-3 max-w-2xl mx-auto">
          A daily intelligence record of attacks observed against the Cloud Canary honeypot —
          a deliberately vulnerable cloud surface deployed to study adversary behaviour.
        </p>
      </div>
      <div className="hr-strong" />
      <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between text-[11px] text-ink3">
        <span className="smallcaps">Edition · {date.toUpperCase()}</span>
        <span className="italic">Compiled live from /decoy/* observations</span>
        <span className="smallcaps">Page 01</span>
      </div>
      <div className="hr-soft" />
    </header>
  );
}
