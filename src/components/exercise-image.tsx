"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  name: string;
  className?: string;
  imageClassName?: string;
};

export function ExerciseImage({ src, name, className = "", imageClassName = "" }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`exercise-image-trigger ${className}`}
        onClick={() => setOpen(true)}
        aria-label={`Enlarge ${name} exercise illustration`}
      >
        <img src={src} alt={name} loading="lazy" className={imageClassName} />
        <span className="exercise-image-hint" aria-hidden="true">View illustration</span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="image-lightbox fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={`${name} exercise illustration`}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <div className="image-lightbox-panel relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-900 p-3 shadow-2xl sm:p-5">
                <button
                  type="button"
                  className="absolute right-5 top-5 z-10 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-black"
                  onClick={() => setOpen(false)}
                  autoFocus
                >
                  Close <span aria-hidden="true">×</span>
                </button>
                <img src={src} alt={name} className="max-h-[78vh] w-full rounded-2xl object-contain" />
                <p className="px-2 pt-3 text-center font-semibold text-white">{name}</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
