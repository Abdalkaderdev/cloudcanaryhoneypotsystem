function pad(n: number) {
  return String(n).padStart(3, "0");
}

export function StatusCards({
  totalAttacks, monitoredEndpoints, uniqueIps, lastHourAttacks
}: {
  totalAttacks: number; monitoredEndpoints: number; uniqueIps: number; lastHourAttacks: number;
}) {
  const tiles = [
    { code: "T-01", label: "TOTAL EVENTS",        value: totalAttacks,       sub: "all time" },
    { code: "T-02", label: "DECOY ENDPOINTS",     value: monitoredEndpoints, sub: "monitored" },
    { code: "T-03", label: "UNIQUE THREAT IPS",   value: uniqueIps,          sub: "24h window" },
    { code: "T-04", label: "EVENTS / LAST HOUR",  value: lastHourAttacks,    sub: "60m window" }
  ];
  return (
    <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4 border border-border">
      {tiles.map((t) => (
        <div key={t.code} className="bg-panel p-5 relative">
          <div className="flex items-center justify-between text-[10px] tracking-widest2 text-inkLow">
            <span>{t.code}</span>
            <span>{t.sub.toUpperCase()}</span>
          </div>
          <div className="mt-3 bignum text-[64px] text-amber">
            {pad(t.value)}
          </div>
          <div className="mt-2 text-[11px] tracking-widest2 text-inkMid">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
