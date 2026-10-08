"use client";

import { useCallback, useEffect, useState } from "react";
import { getWorkoutChangeEventName, getWorkoutData, getWorkoutStorageKey, type WorkoutData } from "@/lib/storage";

const EMPTY_DATA: WorkoutData = { sessions: [], logs: [] };

export function useWorkoutData() {
  const [data, setData] = useState<WorkoutData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setData(getWorkoutData());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read saved workout data.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(refresh, 0);
    const onStorage = (event: StorageEvent) => {
      if (event.key === getWorkoutStorageKey()) refresh();
    };
    const changeEvent = getWorkoutChangeEventName();
    window.addEventListener("storage", onStorage);
    window.addEventListener(changeEvent, refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(changeEvent, refresh);
    };
  }, [refresh]);

  return { ...data, ready, error, refresh };
}
