"use client";

import type { DayKey } from "@/lib/plan";
import { useWorkoutData } from "@/lib/use-workout-data";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { StartWorkoutButton } from "@/components/start-workout-button";

export function WorkoutActions({ dayKey }: { dayKey: DayKey }) {
  const { sessions, ready, error } = useWorkoutData();
  const open = sessions.find((session) => session.dayKey === dayKey && !session.completedAt);

  if (!ready) return <p className="text-sm text-zinc-400">Loading saved workouts…</p>;
  if (error) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="flex items-center gap-2">
      {open && <DeleteSessionButton sessionId={open.id} status="active" compact />}
      <StartWorkoutButton dayKey={dayKey} resumeId={open?.id} />
    </div>
  );
}
