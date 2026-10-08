import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { workoutSessions } from "@/db/schema";
import { CATALOG, DAYS, DAY_ORDER, RULES, isDayKey } from "@/lib/plan";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { SiteHeader } from "@/components/site-header";
import { StartWorkoutButton } from "@/components/start-workout-button";

export const dynamic = "force-dynamic";

export default async function WorkoutDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const key = day.toUpperCase();
  if (!isDayKey(key)) notFound();

  const plan = DAYS[key];

  const [open] = await db
    .select()
    .from(workoutSessions)
    .where(and(eq(workoutSessions.dayKey, key), isNull(workoutSessions.completedAt)))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(1);

  return (
    <main className="min-h-screen pb-32">
      <SiteHeader />

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Back to dashboard
        </Link>

        <section className={`rounded-3xl bg-gradient-to-br ${plan.gradient} p-8 shadow-2xl`}>
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">{plan.weekday}</p>
          <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{plan.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-white/20 px-3 py-1 text-white">{plan.items.length} exercises</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-white">⏱ {plan.duration}</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-white">🎯 Fat loss + strength</span>
          </div>
        </section>

        <section className="rounded-3xl bg-zinc-900 p-6 ring-1 ring-white/10">
          <h2 className="text-lg font-bold">Ground rules</h2>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <section className="stagger-list space-y-4">
          <h2 className="text-xl font-bold">Exercises</h2>
          {plan.items.map((item, i) => {
            const ex = CATALOG[item.slug];
            return (
              <article
                key={`${item.slug}-${i}`}
                className="flex flex-col overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 sm:flex-row"
              >
                <div className="relative aspect-video w-full shrink-0 bg-zinc-800 sm:aspect-auto sm:w-64">
                  <img src={ex?.image} alt={ex?.name ?? ""} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-zinc-950/80 text-sm font-bold">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 space-y-3 p-5">
                  <div>
                    <h3 className="text-xl font-bold">{ex?.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{ex?.muscles}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ring-1 ${plan.badge}`}>🎯 {item.prescription}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-200">⏱ Rest {item.rest}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">{ex?.cue}</p>
                  {item.note && (
                    <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-500/30">
                      💡 {item.note}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="flex flex-wrap gap-3 text-sm">
          <span className="text-zinc-400">Other days:</span>
          {DAY_ORDER.filter((d) => d !== key).map((d) => (
            <Link key={d} href={`/workout/${d}`} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20">
              {DAYS[d].weekday} · {DAYS[d].title}
            </Link>
          ))}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-zinc-950/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="text-sm text-zinc-300">
            <p className="font-semibold text-white">
              {plan.weekday} · {plan.title}
            </p>
            <p className="text-xs text-zinc-500">Log each set as you go. Progress saves automatically.</p>
          </div>
          <div className="flex items-center gap-2">
            {open ? (
              <>
                <DeleteSessionButton sessionId={open.id} status="active" compact />
                <StartWorkoutButton dayKey={key} resumeId={open.id} />
              </>
            ) : (
              <StartWorkoutButton dayKey={key} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
