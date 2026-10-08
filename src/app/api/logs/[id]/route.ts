import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseLogs, type SetLog } from "@/db/schema";

export const dynamic = "force-dynamic";

function toNumberOrNull(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > max) return null;
  return value;
}

function sanitizeSets(input: unknown): SetLog[] | null {
  if (!Array.isArray(input)) return null;
  return input.slice(0, 12).map((raw) => {
    const set = (raw ?? {}) as Partial<Record<keyof SetLog, unknown>>;
    return {
      reps: toNumberOrNull(set.reps, 10000),
      weight: toNumberOrNull(set.weight, 1000),
      done: set.done === true,
    };
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logId = Number(id);

  if (!Number.isInteger(logId) || logId <= 0) {
    return NextResponse.json({ error: "Invalid log id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    sets?: unknown;
    notes?: unknown;
    completed?: unknown;
  };

  const patch: { sets?: SetLog[]; notes?: string; completed?: boolean } = {};

  if (body.sets !== undefined) {
    const sets = sanitizeSets(body.sets);
    if (!sets) return NextResponse.json({ error: "Invalid sets" }, { status: 400 });
    patch.sets = sets;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 1000);
  if (typeof body.completed === "boolean") patch.completed = body.completed;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(exerciseLogs)
    .set(patch)
    .where(eq(exerciseLogs.id, logId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
