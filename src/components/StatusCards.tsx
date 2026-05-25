export function StatusCards({
  totalAttacks, monitoredEndpoints, uniqueIps, lastHourAttacks
}: {
  totalAttacks: number; monitoredEndpoints: number; uniqueIps: number; lastHourAttacks: number;
}) {
  const tiles = [
    { label: "Total events / 24h",      value: totalAttacks,       hint: "all attack classes" },
    { label: "Decoy endpoints",         value: monitoredEndpoints, hint: "actively monitored" },
    { label: "Unique threat sources",   value: uniqueIps,          hint: "distinct origin IPs" },
    { label: "Events in the last hour", value: lastHourAttacks,    hint: "60-minute window" }
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
      {tiles.map((t, i) => (
        <div key={t.label} className={`${i > 0 ? "lg:border-l border-rule lg:pl-8" : ""}`}>
          <div className="smallcaps text-ink2 mb-2">{t.label}</div>
          <div className="font-display lining-nums text-ink leading-none" style={{ fontSize: "clamp(48px, 6.5vw, 72px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            {t.value.toLocaleString()}
          </div>
          <div className="byline mt-2">{t.hint}</div>
        </div>
      ))}
    </div>
  );
}
