export function StatusCards({
  totalAttacks, blockedIps, monitoredEndpoints, avgResponses
}: {
  totalAttacks: number; blockedIps: number; monitoredEndpoints: number; avgResponses: number;
}) {
  const tiles = [
    { code: "I",   label: "Total attacks",     value: totalAttacks.toLocaleString(),     hint: "past 24 hours" },
    { code: "II",  label: "Blocked IPs",       value: blockedIps.toLocaleString(),       hint: "passive observation" },
    { code: "III", label: "Active endpoints",  value: monitoredEndpoints.toLocaleString(), hint: "decoys under watch" },
    { code: "IV",  label: "Avg responses",     value: avgResponses.toLocaleString(),     hint: "requests per source" }
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="relative bg-paper2/70 border border-rule p-5 flex flex-col"
        >
          <span className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 bg-burgundy" aria-hidden />
          <div className="flex items-baseline justify-between mb-2">
            <span className="smallcaps text-ink3">{t.label}</span>
            <span className="smallcaps text-ink3" style={{ fontSize: "9.5px" }}>No. {t.code}</span>
          </div>
          <div
            className="font-display text-ink lining-nums leading-none mt-1"
            style={{ fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 500, letterSpacing: "-0.025em", fontVariationSettings: "'opsz' 96" }}
          >
            {t.value}
          </div>
          <div className="byline mt-3" style={{ fontSize: "12px" }}>{t.hint}</div>
        </div>
      ))}
    </div>
  );
}
