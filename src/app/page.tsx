import Link from "next/link";

import { PianoKeysMotif } from "@/components/auth/piano-keys-motif";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-[#07070b] px-4 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12)_0%,_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,191,36,0.08)_0%,_transparent_55%)]" />

      <PianoKeysMotif />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          <span className="text-sm font-medium tracking-[0.25em] text-amber-400/90 uppercase">
            PianoPath
          </span>
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Learn piano your way
        </h1>
        <p className="max-w-md text-lg text-zinc-400">
          Interactive lessons, real-time feedback, and sheet music — all in the browser.
        </p>

        <div className="flex gap-4">
          <Link
            href="/app/dashboard"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:from-amber-400 hover:to-amber-500"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
