"use client";
import { Frame } from "./Frame";

export function AttackTimeline({ data }: { data: { hours_ago: number; count: number }[] }) {
  const ordered = [...data].sort((a, b) => b.hours_ago - a.hours_ago);
  const total = ordered.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...ordered.map((d) => d.count));

  // generate an SVG line path
  const W = 600;
  const H = 160;
  const points = ordered.map((d, i) => {
    const x = (i / (ordered.length - 1)) * W;
    const y = H - (d.count / max) * (H - 16) - 8;
    return [x, y] as const;
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  return (
    <Frame
      kicker="Section 03"
      title="Hour by hour"
      byline={`${total} events plotted across the past 24 hours, UTC.`}
    >
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none" className="w-full h-44">
          {/* horizontal rule at zero */}
          <line x1="0" y1={H} x2={W} y2={H} stroke="#C4B5A0" strokeWidth="1" />
          {/* ticks every 4h */}
          {ordered.map((d, i) =>
            i % 4 === 0 ? (
              <line key={i} x1={(i / (ordered.length - 1)) * W} y1={H} x2={(i / (ordered.length - 1)) * W} y2={H + 4} stroke="#A89A85" strokeWidth="1" />
            ) : null
          )}
          <path d={areaPath} fill="#A8281E" fillOpacity="0.10" />
          <path d={linePath} fill="none" stroke="#A8281E" strokeWidth="1.4" />
          {points.map((p, i) =>
            ordered[i].count > 0 ? (
              <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 3.5 : 1.8} fill="#A8281E" />
            ) : null
          )}
          {/* x labels */}
          {ordered.map((d, i) => {
            if (i % 4 !== 0 && i !== ordered.length - 1) return null;
            const x = (i / (ordered.length - 1)) * W;
            const label = d.hours_ago === 0 ? "now" : `−${d.hours_ago}h`;
            return (
              <text key={`l${i}`} x={x} y={H + 18} textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#7A6A5A">{label}</text>
            );
          })}
        </svg>
      </div>
      <p className="byline mt-3 italic">
        Peak hour: {ordered.reduce((m, d) => d.count > m.count ? d : m, ordered[0] || { count: 0, hours_ago: 0 }).hours_ago === 0 ? "now" : `−${ordered.reduce((m, d) => d.count > m.count ? d : m, ordered[0] || { count: 0, hours_ago: 0 }).hours_ago}h`} ({max} events).
      </p>
    </Frame>
  );
}
