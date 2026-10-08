import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutSessions } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const [deleted] = await db
    .delete(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .returning({ id: workoutSessions.id });

  if (!deleted) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, id: deleted.id });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action !== "finish" && body.action !== "reopen") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const [updated] = await db
    .update(workoutSessions)
    .set({ completedAt: body.action === "finish" ? new Date() : null })
    .where(eq(workoutSessions.id, sessionId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
