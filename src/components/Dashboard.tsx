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
  const [tick, setTick] = useState(0);

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
        setTick(t => t + 1);
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
        <main className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-[12px] tracking-widest2 text-inkLow">
            <span className="blink">█</span> ESTABLISHING UPLINK…
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Header status={stats.system_status} />
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {stats.warning && (
          <div className="hardframe border-warn/60 bg-warn/5 px-4 py-3 text-[11px] tracking-widest2 text-warn">
            ⚠ {stats.warning}
          </div>
        )}
        {err && (
          <div className="hardframe border-threat/60 bg-threat/5 px-4 py-3 text-[11px] tracking-widest2 text-threat">
            ⚠ {err}
          </div>
        )}

        <section>
          <SectionLabel index="001" title="TELEMETRY OVERVIEW" meta={`tick #${String(tick).padStart(4, "0")} · refresh ${REFRESH_MS / 1000}s`} />
          <StatusCards
            totalAttacks={stats.total_attacks}
            monitoredEndpoints={stats.monitored_endpoints}
            uniqueIps={stats.unique_ips}
            lastHourAttacks={stats.last_hour_attacks}
          />
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2"><AttackDistribution distribution={stats.distribution} /></div>
          <div className="lg:col-span-3"><AttackTimeline data={stats.timeline_24h} /></div>
        </div>

        <LiveLogs logs={logs} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Infrastructure items={stats.infrastructure} />
          <TopAttackers items={stats.top_attackers} />
        </div>

        <Rule />
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] tracking-widest2 text-inkLow uppercase">
          <span>// END OF FEED</span>
          <span>CLOUD CANARY HONEYPOT · v1.0 · {logs.length} records loaded</span>
          <span>// 30°C 44.0091°N 43.4877°E</span>
        </footer>
      </main>
    </div>
  );
}

function SectionLabel({ index, title, meta }: { index: string; title: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="section-bar text-[12px]">
        <span className="index">[{index}]</span>&nbsp;{title}
      </h2>
      {meta && <span className="meta text-[10px] hidden sm:inline">{meta}</span>}
    </div>
  );
}
