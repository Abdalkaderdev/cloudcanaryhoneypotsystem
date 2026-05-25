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
        <header className="mb-6">
          {kicker && <div className="smallcaps mb-2">{kicker}</div>}
          {title && (
            <h2
              className="font-display text-ink leading-[1.02]"
              style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.005em" }}
            >
              {title}
            </h2>
          )}
          {byline && <p className="byline mt-2">{byline}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Ornament() {
  return (
    <div className="ornament my-12" aria-hidden>
      <span className="ornament-mark" />
    </div>
  );
}

export function Rule({ kind = "soft" }: { kind?: "soft" | "strong" | "double" }) {
  const c = kind === "double" ? "hr-double" : kind === "strong" ? "hr-strong" : "hr-soft";
  return <div className={c} />;
}
