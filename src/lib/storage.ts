import { DAYS, isDayKey, type DayKey } from "@/lib/plan";

export type SetLog = {
  reps: number | null;
  weight: number | null;
  done: boolean;
};

export type WorkoutSession = {
  id: number;
  dayKey: DayKey;
  startedAt: string;
  completedAt: string | null;
};

export type ExerciseLog = {
  id: number;
  sessionId: number;
  position: number;
  exerciseSlug: string;
  completed: boolean;
  sets: SetLog[];
  notes: string;
};

export type WorkoutData = {
  sessions: WorkoutSession[];
  logs: ExerciseLog[];
};

type StoredWorkoutData = WorkoutData & {
  version: 1;
  nextSessionId: number;
  nextLogId: number;
};

type LogPatch = Partial<Pick<ExerciseLog, "sets" | "notes" | "completed">>;

const STORAGE_KEY = "fittrack.workouts.v1";
const CHANGE_EVENT = "fittrack:workouts-changed";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSetLog(value: unknown): value is SetLog {
  if (!isRecord(value)) return false;
  return (
    (value.reps === null || typeof value.reps === "number") &&
    (value.weight === null || typeof value.weight === "number") &&
    typeof value.done === "boolean"
  );
}

function isWorkoutSession(value: unknown): value is WorkoutSession {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    isDayKey(String(value.dayKey)) &&
    typeof value.startedAt === "string" &&
    (value.completedAt === null || typeof value.completedAt === "string")
  );
}

function isExerciseLog(value: unknown): value is ExerciseLog {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.sessionId === "number" &&
    typeof value.position === "number" &&
    typeof value.exerciseSlug === "string" &&
    typeof value.completed === "boolean" &&
    Array.isArray(value.sets) &&
    value.sets.every(isSetLog) &&
    typeof value.notes === "string"
  );
}

function isStoredWorkoutData(value: unknown): value is StoredWorkoutData {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.nextSessionId === "number" &&
    typeof value.nextLogId === "number" &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isWorkoutSession) &&
    Array.isArray(value.logs) &&
    value.logs.every(isExerciseLog)
  );
}

function readStoredData(): StoredWorkoutData {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return { version: 1, nextSessionId: 1, nextLogId: 1, sessions: [], logs: [] };
  }

  const parsed: unknown = JSON.parse(raw);
  if (!isStoredWorkoutData(parsed)) {
    throw new Error("Saved workout data is invalid. Clear this site's browser storage to continue.");
  }
  return parsed;
}

function writeStoredData(data: StoredWorkoutData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getWorkoutData(): WorkoutData {
  const { sessions, logs } = readStoredData();
  return {
    sessions: [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    logs,
  };
}

export function createWorkoutSession(dayKey: DayKey): WorkoutSession {
  const data = readStoredData();
  const id = data.nextSessionId++;
  const session: WorkoutSession = {
    id,
    dayKey,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  const newLogs = DAYS[dayKey].items.map((item, position): ExerciseLog => ({
    id: data.nextLogId++,
    sessionId: id,
    position,
    exerciseSlug: item.slug,
    completed: false,
    sets: Array.from({ length: item.sets }, () => ({ reps: null, weight: null, done: false })),
    notes: "",
  }));
  data.sessions.push(session);
  data.logs.push(...newLogs);
  writeStoredData(data);
  return session;
}

export function getWorkoutSession(id: number): WorkoutSession | undefined {
  return readStoredData().sessions.find((session) => session.id === id);
}

export function getSessionLogs(sessionId: number): ExerciseLog[] {
  return readStoredData()
    .logs.filter((log) => log.sessionId === sessionId)
    .sort((a, b) => a.position - b.position);
}

export function updateExerciseLog(id: number, patch: LogPatch) {
  const data = readStoredData();
  const log = data.logs.find((entry) => entry.id === id);
  if (!log) throw new Error("Workout exercise was not found.");
  Object.assign(log, patch);
  writeStoredData(data);
}

export function completeWorkoutSession(id: number, completedAt: string | null) {
  const data = readStoredData();
  const session = data.sessions.find((entry) => entry.id === id);
  if (!session) throw new Error("Workout session was not found.");
  session.completedAt = completedAt;
  writeStoredData(data);
}

export function deleteWorkoutSession(id: number) {
  const data = readStoredData();
  const sessions = data.sessions.filter((session) => session.id !== id);
  if (sessions.length === data.sessions.length) throw new Error("Workout session was not found.");
  data.sessions = sessions;
  data.logs = data.logs.filter((log) => log.sessionId !== id);
  writeStoredData(data);
}

export function getWorkoutChangeEventName() {
  return CHANGE_EVENT;
}

export function getWorkoutStorageKey() {
  return STORAGE_KEY;
}
