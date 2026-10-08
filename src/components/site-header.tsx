import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2 font-bold tracking-tight text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-600 text-lg">
            🔥
          </span>
          <span>FitTrack</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/5 hover:text-white">
            Dashboard
          </Link>
          <Link href="/history" className="touch-link rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/5 hover:text-white">
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
