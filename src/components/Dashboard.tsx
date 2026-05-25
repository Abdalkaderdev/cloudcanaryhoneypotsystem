"use client";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { StatusCards } from "./StatusCards";
import { AttackDistribution } from "./AttackDistribution";
import { AttackTimeline } from "./AttackTimeline";
import { LiveLogs } from "./LiveLogs";
import { Infrastructure } from "./Infrastructure";
import { TopAttackers } from "./TopAttackers";
import { Ornament, Rule } from "./Frame";

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
        <main className="mx-auto max-w-5xl px-6 py-10">
          <p className="font-display italic text-ink3 text-[24px]">Establishing connection to the wire…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Header status={stats.system_status} />

      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {stats.warning && <Notice tone="warn">{stats.warning}</Notice>}
        {err && <Notice tone="error">Connection issue: {err}</Notice>}

        {/* Lead spread */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 mb-12">
          <div className="lg:col-span-8">
            <div className="smallcaps mb-3">No. I — Lead</div>
            <h2
              className="font-display text-ink leading-[0.96]"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, letterSpacing: "-0.015em", fontVariationSettings: "'opsz' 72" }}
            >
              <span className="italic" style={{ fontWeight: 400 }}>{stats.total_attacks.toLocaleString()}</span> events,
              from <span className="italic" style={{ fontWeight: 400 }}>{stats.unique_ips.toLocaleString()}</span> sources,
              in the past twenty-four hours.
            </h2>
            <p className="dropcap mt-8 text-ink2" style={{ fontSize: "18px", lineHeight: 1.55 }}>
              The Cloud Canary honeypot has continued to draw opportunistic traffic from across the public Internet.
              In the most recent hour, <strong className="text-ink" style={{ fontWeight: 600 }}>{stats.last_hour_attacks.toLocaleString()}</strong> interactions
              were recorded across <strong className="text-ink" style={{ fontWeight: 600 }}>{stats.monitored_endpoints}</strong> decoy endpoints —
              a routine cadence, with no anomalous spike of note. Full distribution and provenance are reported below;
              all timestamps are coordinated universal time.
            </p>
          </div>

          <aside className="lg:col-span-4 lg:border-l border-rule lg:pl-12">
            <div className="smallcaps mb-5">At a glance</div>
            <dl className="space-y-4">
              <Stat label="Total events" value={stats.total_attacks.toLocaleString()} />
              <Stat label="Unique sources" value={stats.unique_ips.toLocaleString()} />
              <Stat label="Last hour" value={stats.last_hour_attacks.toLocaleString()} />
              <Stat label="Decoys watched" value={stats.monitored_endpoints.toLocaleString()} />
            </dl>
          </aside>
        </section>

        <Ornament />

        <StatusCards
          totalAttacks={stats.total_attacks}
          monitoredEndpoints={stats.monitored_endpoints}
          uniqueIps={stats.unique_ips}
          lastHourAttacks={stats.last_hour_attacks}
        />

        <Ornament />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12">
          <div className="lg:col-span-5"><AttackDistribution distribution={stats.distribution} /></div>
          <div className="lg:col-span-7"><AttackTimeline data={stats.timeline_24h} /></div>
        </div>

        <Ornament />

        <LiveLogs logs={logs} />

        <Ornament />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
          <Infrastructure items={stats.infrastructure} />
          <TopAttackers items={stats.top_attackers} />
        </div>

        <div className="mt-16">
          <Rule kind="strong" />
          <footer className="grid grid-cols-3 gap-4 py-6 text-[10px] text-ink3 items-center">
            <span className="smallcaps">— Finis —</span>
            <span className="text-center smallcaps">Cloud Canary · Watch I</span>
            <span className="text-right byline italic" style={{ fontSize: "12px" }}>this page refreshes every {REFRESH_MS / 1000} seconds</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 pb-3">
      <dt className="smallcaps">{label}</dt>
      <dd
        className="font-display text-ink lining-nums"
        style={{ fontSize: "26px", fontWeight: 500, letterSpacing: "-0.015em" }}
      >
        {value}
      </dd>
    </div>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "warn" | "error" }) {
  const color = tone === "error" ? "text-burgundy border-burgundy" : "text-gold border-gold";
  return (
    <div className={`border-l-2 ${color} pl-5 py-2 italic font-display mb-8`} style={{ fontSize: "16px" }}>
      {children}
    </div>
  );
}
