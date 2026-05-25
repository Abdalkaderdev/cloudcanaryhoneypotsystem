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

const REFRESH_MS = 6000;

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const [s, l] = await Promise.all([
          fetch("/api/stats", { cache: "no-store" }).then(r => r.json()),
          fetch("/api/logs?limit=50", { cache: "no-store" }).then(r => r.json()),
        ]);
        if (cancelled) return;
        setStats(s);
        setLogs(l.logs || []);
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
          <p className="font-display italic text-ink3 text-lg">Establishing connection to the wire…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Header status={stats.system_status} />

      <main className="mx-auto max-w-6xl px-6 py-8 sm:py-10 space-y-10">
        {stats.warning && (
          <Notice tone="warn">{stats.warning}</Notice>
        )}
        {err && (
          <Notice tone="error">Connection issue: {err}</Notice>
        )}

        {/* Lead spread */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
          <div className="lg:col-span-7">
            <div className="smallcaps mb-2">Section 01 · Lead</div>
            <h2 className="font-display text-ink leading-[0.95]" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.015em" }}>
              <span className="italic font-700">{stats.total_attacks.toLocaleString()}</span> events,{" "}
              {stats.unique_ips.toLocaleString()} sources, in the past 24 hours.
            </h2>
            <p className="dropcap font-display text-ink2 mt-5 leading-snug" style={{ fontSize: "16px" }}>
              The Cloud Canary honeypot continues to attract opportunistic traffic.
              In the most recent hour, <strong className="text-ink">{stats.last_hour_attacks.toLocaleString()}</strong> interactions
              were captured across <strong className="text-ink">{stats.monitored_endpoints}</strong> decoy endpoints.
              Distribution and provenance are reported below, with all timestamps in coordinated universal time.
            </p>
          </div>

          <aside className="lg:col-span-5 lg:border-l border-rule lg:pl-10">
            <div className="smallcaps mb-3">At a glance</div>
            <dl className="space-y-3">
              <Stat label="Total events / 24h" value={stats.total_attacks.toLocaleString()} />
              <Stat label="Unique threat sources" value={stats.unique_ips.toLocaleString()} />
              <Stat label="Events / last hour" value={stats.last_hour_attacks.toLocaleString()} />
              <Stat label="Monitored decoys" value={stats.monitored_endpoints.toLocaleString()} />
            </dl>
          </aside>
        </section>

        <Rule kind="strong" />

        <StatusCards
          totalAttacks={stats.total_attacks}
          monitoredEndpoints={stats.monitored_endpoints}
          uniqueIps={stats.unique_ips}
          lastHourAttacks={stats.last_hour_attacks}
        />

        <Rule />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10">
          <div className="lg:col-span-5"><AttackDistribution distribution={stats.distribution} /></div>
          <div className="lg:col-span-7"><AttackTimeline data={stats.timeline_24h} /></div>
        </div>

        <Rule />

        <LiveLogs logs={logs} />

        <Rule />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
          <Infrastructure items={stats.infrastructure} />
          <TopAttackers items={stats.top_attackers} />
        </div>

        <Rule kind="thick" />

        <footer className="grid grid-cols-3 gap-4 py-6 text-[11px] text-ink3 smallcaps">
          <span>— end of edition —</span>
          <span className="text-center">Cloud Canary · v1.0</span>
          <span className="text-right italic font-normal">refreshed every {REFRESH_MS / 1000}s</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule/50 pb-2">
      <dt className="font-display text-[14px] text-ink2" style={{ fontWeight: 500 }}>{label}</dt>
      <dd className="font-display text-ink lining-nums text-[22px]" style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{value}</dd>
    </div>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "warn" | "error" }) {
  const color = tone === "error" ? "text-red border-red" : "text-ochre border-ochre";
  return (
    <div className={`border-l-2 ${color} pl-4 py-2 italic font-display text-[15px]`}>
      {children}
    </div>
  );
}
