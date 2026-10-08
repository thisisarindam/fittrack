"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SessionPlayer, type LogRow, type SessionRow } from "@/components/session-player";
import { getSessionLogs, getWorkoutSession } from "@/lib/storage";

export function SessionRoute() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const [session, setSession] = useState<SessionRow | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [ready, setReady] = useState(false);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      setError(null);
      setSession(null);
      setLogs([]);

      const id = Number(sessionId);
      if (!sessionId || !Number.isInteger(id) || id <= 0) {
        setError("This workout link is invalid.");
        setReady(true);
        setLoadedSessionId(sessionId);
        return;
      }

      try {
        const savedSession = getWorkoutSession(id);
        if (!savedSession) {
          setError("This workout could not be found in this browser.");
        } else {
          setSession(savedSession);
          setLogs(getSessionLogs(id));
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load the saved workout.");
      } finally {
        setReady(true);
        setLoadedSessionId(sessionId);
      }
    };
    const loadTimer = window.setTimeout(load, 0);
    return () => window.clearTimeout(loadTimer);
  }, [sessionId]);

  return (
    <>
      {ready && loadedSessionId === sessionId && session ? (
        <SessionPlayer session={session} initialLogs={logs} />
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-zinc-300">{ready && loadedSessionId === sessionId ? error : "Loading workout…"}</p>
          {ready && loadedSessionId === sessionId && error && (
            <Link href="/history" className="mt-4 inline-block text-sm font-semibold text-white underline underline-offset-4">
              Go to workout history
            </Link>
          )}
        </div>
      )}
    </>
  );
}
