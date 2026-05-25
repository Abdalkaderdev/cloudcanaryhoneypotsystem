import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLOUD CANARY // OBSERVATION TERMINAL",
  description: "Cloud Canary Honeypot — live attack observation terminal.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
