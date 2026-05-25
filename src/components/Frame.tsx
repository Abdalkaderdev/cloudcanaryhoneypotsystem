import { cn } from "@/lib/utils";

export function Frame({
  index, title, meta, children, className, dense
}: {
  index?: string; title?: string; meta?: string;
  children: React.ReactNode; className?: string; dense?: boolean;
}) {
  return (
    <section className={cn("hardframe", className)}>
      {(index || title || meta) && (
        <header className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-2.5">
          <h2 className="section-bar text-[11px] sm:text-[12px] flex items-baseline gap-3">
            {index && <span className="index">[{index}]</span>}
            <span>{title}</span>
          </h2>
          {meta && <span className="meta text-[10px] sm:text-[11px] hidden sm:inline">{meta}</span>}
        </header>
      )}
      <div className={dense ? "p-3" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export function Rule() {
  return (
    <div className="frame-rule" aria-hidden>
      {"─".repeat(180)}
    </div>
  );
}
