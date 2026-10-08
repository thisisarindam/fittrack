import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { exerciseLogs, workoutSessions } from "@/db/schema";
import type { DayKey } from "@/lib/plan";
import { SiteHeader } from "@/components/site-header";
import { SessionPlayer } from "@/components/session-player";

export const dynamic = "force-dynamic";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId) || sessionId <= 0) notFound();

  const [session] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, sessionId)).limit(1);
  if (!session) notFound();

  const logs = await db
    .select()
    .from(exerciseLogs)
    .where(eq(exerciseLogs.sessionId, sessionId))
    .orderBy(asc(exerciseLogs.position));

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <SessionPlayer
        session={{
          id: session.id,
          dayKey: session.dayKey as DayKey,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt ? session.completedAt.toISOString() : null,
        }}
        initialLogs={logs.map((l) => ({
          id: l.id,
          position: l.position,
          exerciseSlug: l.exerciseSlug,
          completed: l.completed,
          sets: l.sets,
          notes: l.notes,
        }))}
      />
    </main>
  );
}
