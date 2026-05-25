import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud Canary — Daily Threat Briefing",
  description: "Daily intelligence briefing on attacks observed by the Cloud Canary honeypot.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
