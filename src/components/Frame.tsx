import { cn } from "@/lib/utils";

export function Frame({
  title, kicker, byline, children, className
}: {
  title?: string;
  kicker?: string;
  byline?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative", className)}>
      {(kicker || title) && (
        <header className="mb-4">
          {kicker && <div className="smallcaps mb-1">{kicker}</div>}
          {title && (
            <h2 className="font-display text-[28px] sm:text-[32px] font-700 text-ink leading-[1.05]" style={{ fontWeight: 700 }}>
              {title}
            </h2>
          )}
          {byline && <p className="byline mt-1">{byline}</p>}
          <div className="hr-soft mt-3" />
        </header>
      )}
      {children}
    </section>
  );
}

export function Rule({ kind = "soft" }: { kind?: "soft" | "strong" | "thick" }) {
  const c = kind === "thick" ? "hr-thick" : kind === "strong" ? "hr-strong" : "hr-soft";
  return <div className={c} />;
}
