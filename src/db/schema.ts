import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type SetLog = {
  reps: number | null; // reps (strength), seconds (plank) or minutes (cardio)
  weight: number | null; // kg, strength only
  done: boolean;
};

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  dayKey: text("day_key").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  exerciseSlug: text("exercise_slug").notNull(),
  completed: boolean("completed").notNull().default(false),
  sets: jsonb("sets").$type<SetLog[]>().notNull().default(sql`'[]'::jsonb`),
  notes: text("notes").notNull().default(""),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
