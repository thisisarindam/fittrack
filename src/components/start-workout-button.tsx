"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DayKey } from "@/lib/plan";

type Props = {
  dayKey: DayKey;
  resumeId?: number | null;
  className?: string;
};

const DEFAULT_CLASS =
  "shine-button action-button inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_35px_-12px_rgba(255,255,255,0.6)] transition hover:scale-[1.035] hover:shadow-[0_16px_45px_-12px_rgba(255,255,255,0.72)] disabled:opacity-60";

export function StartWorkoutButton({ dayKey, resumeId, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (resumeId) {
      router.push(`/session/${resumeId}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayKey }),
      });
      if (!res.ok) throw new Error("Failed to start");
      const data = (await res.json()) as { id: number };
      router.push(`/session/${data.id}`);
    } catch {
      setError("Could not start the workout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading} className={className ?? DEFAULT_CLASS}>
        {loading ? "Starting…" : resumeId ? "Resume workout →" : "Start workout →"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
