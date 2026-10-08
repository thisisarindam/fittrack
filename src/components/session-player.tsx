"use client";

import Link from "next/link";
import { useState } from "react";
import type { SetLog } from "@/db/schema";
import { CATALOG, DAYS, type DayKey, type ExerciseKind } from "@/lib/plan";
import { summarizeLogs } from "@/lib/summary";
import { RestTimer } from "@/components/rest-timer";

export type LogRow = {
  id: number;
  position: number;
  exerciseSlug: string;
  completed: boolean;
  sets: SetLog[];
  notes: string;
};

export type SessionRow = {
  id: number;
  dayKey: DayKey;
  startedAt: string;
  completedAt: string | null;
};

type LogPatch = Partial<Pick<LogRow, "sets" | "notes" | "completed">>;

function sortLogs(rows: LogRow[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

function parseNum(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 ring-1 ring-white/10 focus-within:ring-white/40">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-20 bg-transparent text-lg font-semibold tabular-nums outline-none placeholder:text-zinc-600"
      />
      <span className="text-xs uppercase tracking-wide text-zinc-400">{label}</span>
    </label>
  );
}

function SetRow({
  index,
  kind,
  target,
  set,
  onCommit,
}: {
  index: number;
  kind: ExerciseKind;
  target: string;
  set: SetLog;
  onCommit: (next: SetLog) => void;
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");

  function commit(done: boolean) {
    onCommit({
      reps: parseNum(reps),
      weight: kind === "strength" ? parseNum(weight) : null,
      done,
    });
  }

  const repLabel = kind === "strength" ? "reps" : kind === "hold" ? "sec" : "min";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition ${
        set.done ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold">
        {index + 1}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {kind === "strength" && (
          <Field
            label="kg"
            value={weight}
            onChange={setWeight}
            onBlur={() => commit(set.done)}
            inputMode="decimal"
            placeholder="—"
          />
        )}
        <Field
          label={repLabel}
          value={reps}
          onChange={setReps}
          onBlur={() => commit(set.done)}
          inputMode="decimal"
          placeholder={target}
        />
      </div>
      <button
        type="button"
        onClick={() => commit(!set.done)}
        aria-pressed={set.done}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          set.done ? "bg-emerald-500 text-zinc-950" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {set.done ? "✓ Done" : "Mark done"}
      </button>
    </div>
  );
}

function NotesField({ initial, onCommit }: { initial: string; onCommit: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== initial) onCommit(value);
      }}
      rows={2}
      placeholder="e.g. Felt strong, raised the seat by one notch"
      className="mt-2 w-full rounded-xl bg-zinc-950 p-3 text-sm text-zinc-100 ring-1 ring-white/10 outline-none placeholder:text-zinc-600 focus:ring-white/40"
    />
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-200">{children}</span>;
}

export function SessionPlayer({ session, initialLogs }: { session: SessionRow; initialLogs: LogRow[] }) {
  const plan = DAYS[session.dayKey];

  const [logs, setLogs] = useState<LogRow[]>(() => sortLogs(initialLogs));
  const [index, setIndex] = useState<number>(() => {
    const i = sortLogs(initialLogs).findIndex((l) => !l.completed);
    return i === -1 ? 0 : i;
  });
  const [finished, setFinished] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | null>(session.completedAt);
  const [error, setError] = useState<string | null>(null);

  const total = logs.length;
  const summary = summarizeLogs(logs);
  const progressPct = total ? Math.round((summary.completed / total) * 100) : 0;
  const current = logs[index];
  const item = plan.items[index];
  const ex = item ? CATALOG[item.slug] : undefined;
  const targetRange = item ? (item.prescription.match(/\d+(?:–\d+)?/g) ?? []).at(-1) ?? "" : "";

  async function save(id: number, patch: LogPatch) {
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("save failed");
      setError(null);
    } catch {
      setError("Couldn't save your last change. Check your connection and try again.");
    }
  }

  function update(id: number, patch: LogPatch) {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    void save(id, patch);
  }

  function updateSet(log: LogRow, setIndex: number, next: SetLog) {
    const sets = log.sets.map((s, i) => (i === setIndex ? next : s));
    update(log.id, { sets });
  }

  async function finishWorkout() {
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finish" }),
      });
      if (!res.ok) throw new Error("finish failed");
      const data = (await res.json()) as { completedAt: string | null };
      setCompletedAt(data.completedAt);
      setFinished(true);
    } catch {
      setError("Couldn't finish the workout. Please try again.");
    }
  }

  function handlePrimary() {
    if (!current) return;
    const isLast = index >= total - 1;

    if (!current.completed) {
      update(current.id, { completed: true });
      if (!isLast) setIndex(index + 1);
      else void finishWorkout();
      return;
    }

    if (!isLast) setIndex(index + 1);
    else void finishWorkout();
  }

  if (finished) {
    const minutes = completedAt
      ? Math.round((new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
      : 0;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="celebration-icon text-6xl">🏆</div>
        <h1 className="mt-4 text-3xl font-extrabold">Workout complete!</h1>
        <p className="mt-2 text-zinc-400">
          {plan.weekday} · {plan.title}
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Exercises" value={`${summary.completed}/${total}`} />
          <Stat label="Sets done" value={String(summary.setsDone)} />
          <Stat label="Minutes" value={String(minutes)} />
        </div>
        <p className="mt-4 text-sm text-zinc-400">Total logged volume: {summary.volume} kg</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setFinished(false)}
            className="rounded-2xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20"
          >
            Review workout
          </button>
          <Link href="/history" className="rounded-2xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">
            History
          </Link>
          <Link href="/" className="rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!current || !item || !ex) {
    return <p className="p-8 text-center text-zinc-400">This workout couldn&apos;t be loaded.</p>;
  }

  const isLast = index >= total - 1;
  const primaryLabel = !isLast
    ? current.completed
      ? "Next exercise →"
      : "Mark complete & next →"
    : "Finish workout 🎉";

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${plan.badge.split(" ")[1]}`}>
            {plan.weekday} · {plan.title}
          </p>
          <h1 className="text-2xl font-bold">Workout in progress</h1>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          Exit
        </Link>
      </div>

      <div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>
            {summary.completed}/{total} exercises done
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {logs.map((l, i) => {
          const chipEx = CATALOG[plan.items[i]?.slug ?? ""];
          const active = i === index;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                active
                  ? "bg-white text-zinc-950 ring-white"
                  : l.completed
                    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40"
                    : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
              }`}
            >
              {l.completed ? "✓ " : `${i + 1}. `}
              {chipEx?.name ?? "Exercise"}
            </button>
          );
        })}
      </div>

      {error && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">{error}</p>}

      <article key={current.id} className="exercise-stage overflow-hidden rounded-3xl bg-zinc-900 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <div className="relative aspect-[16/9] bg-zinc-800">
          <img src={ex.image} alt={ex.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Exercise {index + 1} of {total}
            </p>
            <h2 className="text-3xl font-extrabold">{ex.name}</h2>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">
            <Pill>🎯 {item.prescription}</Pill>
            <Pill>⏱ Rest: {item.rest}</Pill>
            <Pill>💪 {ex.muscles}</Pill>
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">{ex.cue}</p>

          {item.note && (
            <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200 ring-1 ring-amber-500/30">
              💡 {item.note}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Log your sets</h3>
              <span className="text-xs text-zinc-500">Pick a weight with ~2 reps left in the tank</span>
            </div>
            {current.sets.map((s, i) => (
              <SetRow
                key={`${current.id}-${i}`}
                index={i}
                kind={ex.kind}
                target={targetRange}
                set={s}
                onCommit={(next) => updateSet(current, i, next)}
              />
            ))}
          </div>

          {item.restSeconds > 0 && <RestTimer key={`rest-${current.id}`} seconds={item.restSeconds} />}

          <div>
            <label className="text-sm font-semibold">Notes</label>
            <NotesField
              key={`notes-${current.id}`}
              initial={current.notes}
              onCommit={(notes) => update(current.id, { notes })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 disabled:opacity-40"
          >
            ← Previous
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handlePrimary}
              className={`shine-button rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg bg-gradient-to-r ${plan.gradient} hover:scale-[1.025] hover:brightness-110`}
            >
              {primaryLabel}
            </button>
            {current.completed && (
              <button
                type="button"
                onClick={() => update(current.id, { completed: false })}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Undo complete
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{label}</p>
    </div>
  );
}
