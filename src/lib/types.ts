export type AttackType =
  | "recon"
  | "brute_force"
  | "sql_injection"
  | "xss"
  | "command_injection"
  | "path_traversal"
  | "malformed_payload"
  | "unknown";

export interface AttackLog {
  id?: string;
  timestamp: number;
  ip: string;
  method: string;
  endpoint: string;
  userAgent: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | null;
  attackType: AttackType;
  payloadSnippet: string;
  country?: string;
  countryCode?: string;
  city?: string;
}

export interface Stats {
  systemStatus: "active" | "degraded" | "down";
  totalAttacks: number;
  monitoredEndpoints: number;
  uniqueIps: number;
  lastHourAttacks: number;
  distribution: Record<AttackType, number>;
  timeline24h: { hour: number; count: number }[];
  topAttackers: { ip: string; count: number; country?: string; last: number }[];
  infrastructure: { name: string; status: "ok" | "warn" | "down" }[];
}
