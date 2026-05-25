"use client";
import { Frame } from "./Frame";

export function AttackTimeline({ data }: { data: { hours_ago: number; count: number }[] }) {
  const ordered = [...data].sort((a, b) => b.hours_ago - a.hours_ago);
  const total = ordered.reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...ordered.map((d) => d.count));
  const peak = ordered.reduce((m, d) => (d.count > m.count ? d : m), ordered[0] || { count: 0, hours_ago: 0 });

  const W = 640, H = 170, padX = 6, padTop = 10, padBottom = 26;
  const innerH = H - padTop - padBottom;
  const pts = ordered.map((d, i) => {
    const x = padX + (i / (ordered.length - 1)) * (W - padX * 2);
    const y = padTop + (1 - d.count / max) * innerH;
    return [x, y] as const;
  });
  const linePath = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const [px, py] = pts[i - 1];
    const cpx = (px + x) / 2;
    return `${acc} C ${cpx.toFixed(1)} ${py.toFixed(1)}, ${cpx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, "");
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${(H - padBottom).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(H - padBottom).toFixed(1)} Z`;

  return (
    <Frame
      kicker="No. VI"
      title="A chronicle, hour by hour"
      byline={`${total.toLocaleString()} interactions across the past twenty-four hours, UTC.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-40">
        <line x1={padX} y1={H - padBottom} x2={W - padX} y2={H - padBottom} stroke="#D5C9B1" strokeWidth="1" />
        {ordered.map((d, i) =>
          i % 4 === 0 ? (
            <line
              key={`tick-${i}`}
              x1={padX + (i / (ordered.length - 1)) * (W - padX * 2)}
              y1={H - padBottom}
              x2={padX + (i / (ordered.length - 1)) * (W - padX * 2)}
              y2={H - padBottom + 4}
              stroke="#B9AC91"
              strokeWidth="1"
            />
          ) : null
        )}
        <path d={areaPath} fill="#7D1F1F" fillOpacity="0.08" />
        <path d={linePath} fill="none" stroke="#7D1F1F" strokeWidth="1.4" />
        {pts.map(([x, y], i) =>
          ordered[i].count > 0 ? (
            <circle
              key={`pt-${i}`}
              cx={x}
              cy={y}
              r={i === pts.length - 1 ? 4 : 1.8}
              fill={i === pts.length - 1 ? "#7D1F1F" : "#0E0C0A"}
            />
          ) : null
        )}
        {ordered.map((d, i) => {
          if (i % 4 !== 0 && i !== ordered.length - 1) return null;
          const x = padX + (i / (ordered.length - 1)) * (W - padX * 2);
          const label = d.hours_ago === 0 ? "now" : `−${d.hours_ago}h`;
          return (
            <text key={`label-${i}`} x={x} y={H - 8} textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#857A6B">
              {label}
            </text>
          );
        })}
      </svg>
      <p className="byline mt-3 italic" style={{ fontSize: "13px" }}>
        Peak activity {peak.hours_ago === 0 ? "in the current hour" : `${peak.hours_ago} hour${peak.hours_ago === 1 ? "" : "s"} ago`} — {peak.count.toLocaleString()} interactions.
      </p>
    </Frame>
  );
}
