import type { SetLog } from "@/lib/storage";

export function summarizeLogs(logs: { completed: boolean; sets: SetLog[] }[]) {
  let completed = 0;
  let setsDone = 0;
  let volume = 0;

  for (const log of logs) {
    if (log.completed) completed++;
    for (const set of log.sets) {
      if (!set.done) continue;
      setsDone++;
      if (set.weight && set.reps) volume += set.weight * set.reps;
    }
  }

  return { completed, total: logs.length, setsDone, volume: Math.round(volume) };
}
