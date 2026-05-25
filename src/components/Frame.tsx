import { cn } from "@/lib/utils";

export function Frame({
  title, kicker, byline, children, className, dense
}: {
  title?: string;
  kicker?: string;
  byline?: string;
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative bg-paper2/60 border border-rule",
        "p-5 sm:p-6",
        className
      )}
    >
      {/* corner mark — top-left burgundy dot */}
      <span className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 bg-burgundy" aria-hidden />
      {(kicker || title) && (
        <header className={dense ? "mb-3" : "mb-4"}>
          {kicker && <div className="smallcaps mb-1.5">{kicker}</div>}
          {title && (
            <h2
              className="font-display text-ink leading-[1.05]"
              style={{ fontSize: "clamp(22px, 2.2vw, 28px)", fontWeight: 700, letterSpacing: "-0.005em" }}
            >
              {title}
            </h2>
          )}
          {byline && <p className="byline mt-1">{byline}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Rule({ kind = "soft" }: { kind?: "soft" | "strong" | "double" }) {
  const c = kind === "double" ? "hr-double" : kind === "strong" ? "hr-strong" : "hr-soft";
  return <div className={c} />;
}

// kept for back-compat in places where it's already imported
export function Ornament() {
  return <div className="h-6" aria-hidden />;
}
