import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { exerciseLogs, workoutSessions, type ExerciseLog, type WorkoutSession } from "@/db/schema";
import { DAYS, type DayKey } from "@/lib/plan";
import { summarizeLogs } from "@/lib/summary";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const sessions = await db
    .select()
    .from(workoutSessions)
    .orderBy(desc(workoutSessions.startedAt))
    .limit(100);

  const ids = sessions.map((session) => session.id);
  const logs: ExerciseLog[] = ids.length
    ? await db.select().from(exerciseLogs).where(inArray(exerciseLogs.sessionId, ids))
    : [];

  const bySession = new Map<number, ExerciseLog[]>();
  for (const log of logs) {
    const list = bySession.get(log.sessionId) ?? [];
    list.push(log);
    bySession.set(log.sessionId, list);
  }

  const ongoing = sessions.filter((session) => !session.completedAt);
  const past = sessions.filter((session) => session.completedAt);

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Your training archive</p>
          <h1 className="mt-2 text-3xl font-extrabold">Session history</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Resume active workouts or review and manage every completed session.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center text-zinc-400">
            <div className="mb-4 text-4xl">📋</div>
            <p>No sessions yet.</p>
            <Link href="/" className="touch-link mt-3 inline-flex font-semibold text-white underline underline-offset-4">
              Start one from the dashboard →
            </Link>
          </div>
        ) : (
          <>
            <SessionGroup
              title="Ongoing sessions"
              subtitle="Continue where you left off"
              icon="⚡"
              sessions={ongoing}
              bySession={bySession}
              empty="No workouts are currently in progress."
            />
            <SessionGroup
              title="Past sessions"
              subtitle={`${past.length} completed workout${past.length === 1 ? "" : "s"}`}
              icon="✓"
              sessions={past}
              bySession={bySession}
              empty="Your completed workouts will appear here."
            />
          </>
        )}
      </div>
    </main>
  );
}

function SessionGroup({
  title,
  subtitle,
  icon,
  sessions,
  bySession,
  empty,
}: {
  title: string;
  subtitle: string;
  icon: string;
  sessions: WorkoutSession[];
  bySession: Map<number, ExerciseLog[]>;
  empty: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sm ring-1 ring-white/10">{icon}</span>
            {title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-zinc-400 ring-1 ring-white/10">
          {sessions.length}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center text-sm text-zinc-500">
          {empty}
        </div>
      ) : (
        <ul className="stagger-list space-y-4">
          {sessions.map((session) => {
            const day = DAYS[session.dayKey as DayKey];
            const summary = summarizeLogs(bySession.get(session.id) ?? []);
            const percentage = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
            const minutes = session.completedAt
              ? Math.max(1, Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 60000))
              : null;

            return (
              <li
                key={session.id}
                className="motion-card group/session relative overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 hover:-translate-y-1 hover:ring-white/25"
              >
                <div className="flex items-stretch">
                  <Link href={`/session/${session.id}`} className="touch-link min-w-0 flex-1 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${day?.gradient ?? ""} text-xs font-extrabold text-white shadow-lg transition-transform duration-500 group-hover/session:rotate-[-4deg] group-hover/session:scale-110`}
                        >
                          {session.dayKey}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {day?.weekday} · {day?.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {session.startedAt.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {minutes !== null && ` · ${minutes} min`}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              session.completedAt
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {session.completedAt ? "Completed" : "Resume workout"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-sm sm:pr-2">
                        <Metric value={`${summary.completed}/${summary.total}`} label="exercises" />
                        <Metric value={String(summary.setsDone)} label="sets" />
                        <Metric value={String(summary.volume)} label="kg volume" />
                        <span className="text-xl text-zinc-600 transition-transform duration-300 group-hover/session:translate-x-1 group-hover/session:text-white">→</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center border-l border-white/[0.07] px-3 sm:px-4">
                    <DeleteSessionButton
                      sessionId={session.id}
                      status={session.completedAt ? "completed" : "active"}
                      compact
                    />
                  </div>
                </div>
                <div className="h-1.5 bg-white/5">
                  <div
                    className={`progress-motion h-full bg-gradient-to-r ${day?.gradient ?? ""}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-right">
      <p className="font-bold tabular-nums">{value}</p>
      <p className="whitespace-nowrap text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}
