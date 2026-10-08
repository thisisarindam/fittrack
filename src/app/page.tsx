"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATALOG, DAYS, DAY_ORDER, getNextScheduledDay } from "@/lib/plan";
import { summarizeLogs } from "@/lib/summary";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { SiteHeader } from "@/components/site-header";
import { StartWorkoutButton } from "@/components/start-workout-button";
import { useWorkoutData } from "@/lib/use-workout-data";

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return d;
}

export default function HomePage() {
  const { sessions, logs, ready, error } = useWorkoutData();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const currentDate = now ?? new Date(0);
  const weekStart = startOfWeek(currentDate);

  const openSession = sessions.find((session) => !session.completedAt);
  const recent = sessions.slice(0, 6);
  const allTime = sessions.filter((session) => session.completedAt).length;
  const doneThisWeek = new Set(
    sessions
      .filter((session) => session.completedAt && new Date(session.completedAt) >= weekStart)
      .map((session) => session.dayKey),
  );
  const recentIds = new Set(recent.map((session) => session.id));
  const recentLogs = logs.filter((log) => recentIds.has(log.sessionId));

  const next = getNextScheduledDay(currentDate);
  const nextDay = next.day;

  const openDay = openSession ? DAYS[openSession.dayKey] : null;

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {error && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        {/* Hero */}
        <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${nextDay.gradient} p-8 shadow-2xl`}>
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            {openDay ? "Workout in progress" : next.isToday ? "Today's workout" : "Next up"}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {openDay ? `${openDay.weekday} · ${openDay.title}` : `${nextDay.weekday} · ${nextDay.title}`}
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            {openDay
              ? "Pick up right where you left off — your logged sets are saved."
              : `${nextDay.items.length} exercises · ${nextDay.duration}. Go one exercise at a time and log every set.`}
          </p>
          <div className="mt-6">
            {!ready ? (
              <p className="text-sm text-white/80">Loading saved workouts…</p>
            ) : openSession ? (
              <StartWorkoutButton dayKey={openSession.dayKey} resumeId={openSession.id} />
            ) : (
              <StartWorkoutButton dayKey={nextDay.key} />
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          <Stat label="This week" value={ready ? `${doneThisWeek.size}/3` : "—"} hint="scheduled sessions" />
          <Stat label="All-time" value={ready ? String(allTime) : "—"} hint="completed workouts" />
          <Stat label="In progress" value={ready ? (openSession ? "1" : "0") : "—"} hint={openSession ? "unfinished" : "none"} />
        </section>

        {/* Schedule */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Weekly schedule</h2>
            <p className="text-sm text-zinc-400">Mon → Wed → Sat</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {DAY_ORDER.map((key) => {
              const day = DAYS[key];
              const done = doneThisWeek.has(key);
              return (
                <Link
                  key={key}
                  href={`/workout/${key}`}
                  className="group overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/30"
                >
                  <div className={`bg-gradient-to-br ${day.gradient} p-5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/80">{day.weekday}</span>
                      {done && (
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                          ✓ Done this week
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-2xl font-extrabold text-white">{day.title}</h3>
                    <p className="text-sm text-white/80">
                      {day.items.length} exercises · {day.duration}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-3">
                    {day.items.map((item, i) => (
                      <div key={`${key}-${i}`} className="aspect-square overflow-hidden rounded-lg bg-zinc-800">
                        <img
                          src={CATALOG[item.slug]?.image}
                          alt={CATALOG[item.slug]?.name ?? ""}
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-5 pb-5 text-sm font-semibold text-zinc-300">
                    <span>View exercises</span>
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Recent sessions</h2>
          {!ready ? (
            <p className="text-sm text-zinc-400">Loading saved workouts…</p>
          ) : recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
              No workouts yet. Start your first one above!
            </div>
          ) : (
            <ul className="stagger-list divide-y divide-white/10 overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10">
              {recent.map((s) => {
                const day = DAYS[s.dayKey];
                const logs = recentLogs.filter((l) => l.sessionId === s.id);
                const sum = summarizeLogs(logs);
                return (
                  <li key={s.id} className="group/recent flex items-stretch transition-colors hover:bg-white/5">
                    <Link href={`/session?id=${s.id}`} className="touch-link flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {day?.weekday} · {day?.title}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(s.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {sum.completed}/{sum.total} exercises
                        </p>
                        <p className={`text-xs ${s.completedAt ? "text-emerald-400" : "text-amber-300"}`}>
                          {s.completedAt ? "Completed" : "In progress"}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center border-l border-white/[0.07] px-3">
                      <DeleteSessionButton sessionId={s.id} status={s.completedAt ? "completed" : "active"} compact />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-5 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
