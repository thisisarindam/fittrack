import { NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseLogs, workoutSessions } from "@/db/schema";
import { DAYS, isDayKey } from "@/lib/plan";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { dayKey?: unknown } | null;
  const dayKey = body?.dayKey;

  if (typeof dayKey !== "string" || !isDayKey(dayKey)) {
    return NextResponse.json({ error: "Invalid workout day" }, { status: 400 });
  }

  const plan = DAYS[dayKey];

  const [session] = await db
    .insert(workoutSessions)
    .values({ dayKey })
    .returning({ id: workoutSessions.id });

  await db.insert(exerciseLogs).values(
    plan.items.map((item, position) => ({
      sessionId: session.id,
      position,
      exerciseSlug: item.slug,
      sets: Array.from({ length: item.sets }, () => ({ reps: null, weight: null, done: false })),
    })),
  );

  return NextResponse.json({ id: session.id }, { status: 201 });
}
