import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SessionRoute } from "./session-route";

export default function SessionPage() {
  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-8 text-zinc-400">Loading workout…</p>}>
        <SessionRoute />
      </Suspense>
    </main>
  );
}
