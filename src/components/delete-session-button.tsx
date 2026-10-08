"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  sessionId: number;
  label?: string;
  status?: "active" | "completed";
  redirectTo?: string;
  compact?: boolean;
  className?: string;
};

export function DeleteSessionButton({
  sessionId,
  label = "Delete",
  status = "completed",
  redirectTo,
  compact = false,
  className = "",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    // Keep the page from scrolling behind the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, deleting]);

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Could not delete this session. Please try again.");
      setDeleting(false);
    }
  }

  const dialog = open ? (
    <div
      className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`delete-title-${sessionId}`}
        aria-describedby={`delete-desc-${sessionId}`}
        className="modal-panel relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-7 shadow-[0_35px_100px_-25px_rgba(244,63,94,0.35)] sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="relative">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 text-3xl ring-1 ring-rose-500/30">
            🗑️
          </div>

          <h2 id={`delete-title-${sessionId}`} className="mt-6 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            Delete {status === "active" ? "ongoing" : "past"} session?
          </h2>

          <div id={`delete-desc-${sessionId}`} className="mt-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
            <p className="text-base leading-relaxed text-zinc-200">
              {status === "active"
                ? "Your current exercise progress, logged sets, weights, and notes will be permanently removed."
                : "This workout and all of its logged sets, weights, volume, and notes will be permanently removed from history."}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rose-300">
              <span aria-hidden="true">⚠</span> This cannot be undone
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-500/10 p-3.5 text-base text-rose-200 ring-1 ring-rose-500/25">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setOpen(false)}
              className="touch-burst rounded-xl bg-white/10 px-5 py-3 text-base font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-50"
            >
              Keep session
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={remove}
              className="touch-burst danger-pulse rounded-xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(244,63,94,0.8)] hover:bg-rose-400 disabled:cursor-wait disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete forever"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${label} session`}
        className={`touch-burst delete-trigger group/delete inline-flex items-center justify-center gap-2 rounded-xl text-rose-300 ring-1 ring-rose-500/20 hover:bg-rose-500/15 hover:text-rose-200 hover:ring-rose-500/45 ${
          compact ? "h-9 w-9 p-0" : "px-3 py-2 text-sm font-semibold"
        } ${className}`}
      >
        <span className="transition-transform duration-300 group-hover/delete:rotate-[-9deg] group-active/delete:scale-75" aria-hidden="true">
          🗑
        </span>
        {!compact && <span>{label}</span>}
      </button>

      {/* Portal escapes transformed/animated ancestors so the dialog is always viewport-centered. */}
      {dialog && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}
