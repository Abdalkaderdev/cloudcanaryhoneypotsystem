"use client";
import { useEffect, useRef, useState } from "react";
import { attackTypeColor, attackTypeLabel, timeAgo } from "@/lib/utils";
import { Frame } from "./Frame";

type Log = {
  id: string;
  timestamp: number;
  ip: string;
  method: string;
  endpoint: string;
  attack_type: string;
  payload_snippet: string;
  country?: string;
  country_code?: string;
  user_agent: string;
};

export function LiveLogs({ logs }: { logs: Log[] }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const newest = useRef<Set<string>>(new Set());
  useEffect(() => {
    newest.current = new Set();
    logs.forEach((l) => { if (!seen.has(l.id)) newest.current.add(l.id); });
    if (newest.current.size > 0) {
      const next = new Set(seen);
      logs.forEach((l) => next.add(l.id));
      setSeen(next);
    }
  }, [logs, seen]);

  return (
    <Frame index="004" title="LIVE EVENT FEED" meta={`tail -f · ${logs.length} rows · refresh 6s`}>
      {logs.length === 0 ? (
        <div className="text-[11px] tracking-widest2 text-inkMid">
          <span className="blink">█</span> AWAITING INCOMING TRAFFIC
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-[9px] tracking-widest2 text-inkMid border-b border-border">
                <th className="py-2 pl-1 pr-3 font-normal w-12">REC</th>
                <th className="py-2 pr-3 font-normal w-20">T</th>
                <th className="py-2 pr-3 font-normal">IP</th>
                <th className="py-2 pr-3 font-normal w-14">METHOD</th>
                <th className="py-2 pr-3 font-normal">ENDPOINT</th>
                <th className="py-2 pr-3 font-normal">CLASS</th>
                <th className="py-2 pr-3 font-normal">PAYLOAD</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr
                  key={l.id}
                  className={`border-b border-border/40 last:border-0 hover:bg-panel2 ${newest.current.has(l.id) ? "sweep" : ""}`}
                >
                  <td className="py-2 pl-1 pr-3 text-[10px] text-inkMid tabular-nums">
                    {String(logs.length - i).padStart(4, "0")}
                  </td>
                  <td className="py-2 pr-3 text-[11px] text-inkMid whitespace-nowrap">{timeAgo(l.timestamp)}</td>
                  <td className="py-2 pr-3 text-[11px]">
                    <span className="text-ink">{l.ip}</span>
                    {l.country_code && <span className="ml-2 text-inkMid">[{l.country_code}]</span>}
                  </td>
                  <td className="py-2 pr-3 text-[11px] text-amber">{l.method}</td>
                  <td className="py-2 pr-3 text-[11px] text-amberDim truncate max-w-[220px]">{l.endpoint}</td>
                  <td className="py-2 pr-3 text-[11px]">
                    <span
                      className="inline-block border px-1.5 py-0.5 tracking-widest2 uppercase text-[10px]"
                      style={{ borderColor: attackTypeColor(l.attack_type), color: attackTypeColor(l.attack_type) }}
                    >
                      {attackTypeLabel(l.attack_type)}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[11px] text-inkMid truncate max-w-[280px]">
                    {l.payload_snippet ? `›  ${l.payload_snippet}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Frame>
  );
}
