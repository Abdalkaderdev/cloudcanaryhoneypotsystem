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
    <Frame
      kicker="No. IV · From the wire"
      title="Dispatches, in order of arrival"
      byline={`The most recent ${logs.length} interactions captured by the honeypot. Newest first.`}
    >
      {logs.length === 0 ? (
        <p className="font-display italic text-ink3 text-[20px]">— The wire stands silent —</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-ink2 border-b border-rule">
                <th className="py-2 px-2 font-normal smallcaps">When</th>
                <th className="py-2 px-2 font-normal smallcaps">Source</th>
                <th className="py-2 px-2 font-normal smallcaps">Method</th>
                <th className="py-2 px-2 font-normal smallcaps">Endpoint</th>
                <th className="py-2 px-2 font-normal smallcaps">Class</th>
                <th className="py-2 px-2 font-normal smallcaps">Payload</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className={`border-b border-rule/60 last:border-0 ${newest.current.has(l.id) ? "sweep" : ""}`}
                >
                  <td className="py-3 px-2 align-top whitespace-nowrap">
                    <span className="font-mono text-[11px] text-ink2 lining-nums">{timeAgo(l.timestamp)}</span>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <div className="font-mono text-[12px] text-ink lining-nums">{l.ip}</div>
                    {l.country && <div className="byline" style={{ fontSize: "12px" }}>{l.country}</div>}
                  </td>
                  <td className="py-3 px-2 align-top">
                    <span className="font-mono text-[11px] text-ink2">{l.method}</span>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <span className="font-mono text-[11px] text-slate truncate max-w-[200px] inline-block">{l.endpoint}</span>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <span
                      className="font-display italic"
                      style={{ color: attackTypeColor(l.attack_type), fontWeight: 700, fontSize: "14px" }}
                    >
                      {attackTypeLabel(l.attack_type)}
                    </span>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <span className="font-mono text-[11px] text-ink2 truncate max-w-[280px] inline-block">
                      {l.payload_snippet || "—"}
                    </span>
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
