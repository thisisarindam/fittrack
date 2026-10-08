import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitTrack — Fat Loss & Strength",
  description: "Track your Monday / Wednesday / Saturday full-body workouts exercise by exercise.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="app-ambient" aria-hidden="true">
          <div className="ambient-grid" />
          <div className="ambient-orb ambient-orb-one" />
          <div className="ambient-orb ambient-orb-two" />
          <div className="ambient-orb ambient-orb-three" />
          <div className="ambient-grain" />
        </div>
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}
