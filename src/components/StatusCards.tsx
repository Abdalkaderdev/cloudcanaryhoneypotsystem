export function StatusCards({
  totalAttacks, monitoredEndpoints, uniqueIps, lastHourAttacks
}: {
  totalAttacks: number; monitoredEndpoints: number; uniqueIps: number; lastHourAttacks: number;
}) {
  const tiles = [
    { label: "Total events",         value: totalAttacks,       hint: "past 24 hours" },
    { label: "Decoy endpoints",      value: monitoredEndpoints, hint: "under observation" },
    { label: "Unique sources",       value: uniqueIps,          hint: "distinct origins" },
    { label: "Events / last hour",   value: lastHourAttacks,    hint: "60-minute window" }
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10">
      {tiles.map((t, i) => (
        <div key={t.label} className={`${i > 0 ? "lg:border-l border-rule lg:pl-10" : ""}`}>
          <div className="smallcaps text-ink3 mb-3">{t.label}</div>
          <div
            className="font-display text-ink leading-none lining-nums"
            style={{ fontSize: "clamp(56px, 7vw, 88px)", fontWeight: 500, letterSpacing: "-0.025em", fontVariationSettings: "'opsz' 96" }}
          >
            {t.value.toLocaleString()}
          </div>
          <div className="byline mt-3">{t.hint}</div>
        </div>
      ))}
    </div>
  );
}
