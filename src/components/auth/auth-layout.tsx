import Link from "next/link";
import type { ReactNode } from "react";

import { PianoKeysMotif } from "./piano-keys-motif";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[#07070b] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,130,60,0.12)_0%,_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

      <PianoKeysMotif />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="mb-10 flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-amber-400/90 uppercase transition-colors hover:text-amber-300"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          PianoPath
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}
