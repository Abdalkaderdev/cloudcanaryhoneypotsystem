import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "0.0.0.0";
}

export function headersToObject(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((v, k) => { out[k.toLowerCase()] = v; });
  // strip noisy/proxy headers
  delete out["cookie"];
  delete out["set-cookie"];
  return out;
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function attackTypeLabel(t: string): string {
  return ({
    recon: "Reconnaissance",
    brute_force: "Brute Force",
    sql_injection: "SQL Injection",
    xss: "XSS",
    command_injection: "Command Injection",
    path_traversal: "Path Traversal",
    malformed_payload: "Malformed Payload",
    unknown: "Unknown"
  } as Record<string, string>)[t] || t;
}

export function attackTypeColor(t: string): string {
  // Editorial palette — restrained, ink-friendly on cream paper.
  return ({
    recon:             "#1F3B40",  // teal
    brute_force:       "#A0823D",  // ochre
    sql_injection:     "#A8281E",  // ink red
    xss:               "#6B3F8A",  // muted purple
    command_injection: "#7A1F18",  // deep red
    path_traversal:    "#B5651D",  // burnt sienna
    malformed_payload: "#806A2C",  // dark gold
    unknown:           "#7A6A5A"   // ink3
  } as Record<string, string>)[t] || "#7A6A5A";
}
