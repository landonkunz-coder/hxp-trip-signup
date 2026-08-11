import type { Metadata, Viewport } from "next";
// Self-hosted variable fonts (via npm, not Google) -> zero runtime external
// font requests, offline-buildable, and CSP stays font-src 'self'.
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { getFeaturedTrip } from "@/data/trip";

const trip = getFeaturedTrip();

export const metadata: Metadata = {
  metadataBase: new URL("https://hxp-expeditions.example"),
  title: `${trip.name} — HXP Expeditions`,
  description: trip.tagline,
  applicationName: "HXP Expeditions",
  robots: { index: true, follow: true },
  openGraph: {
    title: `${trip.name} — HXP Expeditions`,
    description: trip.tagline,
    type: "website",
    siteName: "HXP Expeditions",
  },
  twitter: {
    card: "summary_large_image",
    title: `${trip.name} — HXP Expeditions`,
    description: trip.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
