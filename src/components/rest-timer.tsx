"use client";

import { useEffect, useState } from "react";

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0 && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [remaining]);

  const running = remaining !== null && remaining > 0;
  const width = remaining === null ? 0 : (remaining / seconds) * 100;

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">Rest timer</p>
          <p className="text-2xl font-bold tabular-nums">
            {remaining === null ? `${seconds}s` : formatTime(remaining)}
          </p>
        </div>
        {running ? (
          <button
            type="button"
            onClick={() => setRemaining(null)}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Skip
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRemaining(seconds)}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            {remaining === 0 ? "Restart" : "Start rest"}
          </button>
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
          style={{ width: `${width}%` }}
        />
      </div>
      {remaining === 0 && <p className="timer-finished mt-2 text-sm text-emerald-300">Rest over — start your next set 💪</p>}
    </div>
  );
}
