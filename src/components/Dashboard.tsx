"use client";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { StatusCards } from "./StatusCards";
import { AttackDistribution } from "./AttackDistribution";
import { AttackTimeline } from "./AttackTimeline";
import { LiveLogs } from "./LiveLogs";
import { Infrastructure } from "./Infrastructure";
import { TopAttackers } from "./TopAttackers";
import { Rule } from "./Frame";

type Stats = {
  system_status: "active" | "degraded" | "down";
  total_attacks: number;
  monitored_endpoints: number;
  unique_ips: number;
  last_hour_attacks: number;
  distribution: Record<string, number>;
  timeline_24h: { hours_ago: number; count: number }[];
  top_attackers: { ip: string; count: number; country?: string; last: number }[];
  infrastructure: { name: string; status: "ok" | "warn" | "down" }[];
  warning?: string;
};
type LogRow = Parameters<typeof LiveLogs>[0]["logs"][number];

const REFRESH_MS = 30000;

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const [sRes, lRes] = await Promise.all([
          fetch("/api/stats", { cache: "no-store" }),
          fetch("/api/logs?limit=50", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (sRes.ok) {
          const s = await sRes.json();
          // guard against partial / malformed responses
          if (s && typeof s.total_attacks === "number") {
            setStats(s);
          }
        }
        if (lRes.ok) {
          const l = await lRes.json();
          setLogs(Array.isArray(l.logs) ? l.logs : []);
        }
        setErr(null);
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "fetch failed");
      }
    }
    fetchAll();
    const t = setInterval(fetchAll, REFRESH_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (!stats) {
    return (
      <div className="min-h-dvh">
        <Header status="degraded" />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <p className="font-display italic text-ink3 text-[20px]">Establishing connection to the wire…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Header status={stats.system_status} />

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {stats.warning && <Notice tone="warn">{stats.warning}</Notice>}
        {err && <Notice tone="error">Connection issue: {err}</Notice>}

        {/* The four key tiles */}
        <StatusCards
          totalAttacks={stats.total_attacks}
          monitoredEndpoints={stats.monitored_endpoints}
          uniqueIps={stats.unique_ips}
          lastHourAttacks={stats.last_hour_attacks}
        />

        {/* Distribution + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><AttackDistribution distribution={stats.distribution} /></div>
          <div className="lg:col-span-7"><AttackTimeline data={stats.timeline_24h} /></div>
        </div>

        {/* Live feed */}
        <LiveLogs logs={logs} />

        {/* Infra + Top attackers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Infrastructure items={stats.infrastructure} />
          <TopAttackers items={stats.top_attackers} />
        </div>

        <div className="pt-2">
          <Rule kind="strong" />
          <footer className="grid grid-cols-3 gap-4 py-5 text-[10px] text-ink3 items-center">
            <span className="smallcaps">— Finis —</span>
            <span className="text-center smallcaps">Cloud Canary · Watch I</span>
            <span className="text-right byline italic" style={{ fontSize: "12px" }}>refreshed every {REFRESH_MS / 1000} seconds</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "warn" | "error" }) {
  const ring = tone === "error" ? "border-burgundy" : "border-gold";
  const text = tone === "error" ? "text-burgundy" : "text-gold";
  return (
    <div className={`bg-paper2/70 border ${ring} border-l-[3px] px-5 py-3 font-display italic ${text}`} style={{ fontSize: "15px" }}>
      {children}
    </div>
  );
}
