"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { PianoKeyboardProps } from "./PianoKeyboard";

const PianoKeyboardInner = dynamic(
  () => import("./PianoKeyboard").then((mod) => ({ default: mod.PianoKeyboard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    ),
  },
);

export function DynamicPianoKeyboard(props: PianoKeyboardProps) {
  return <PianoKeyboardInner {...props} />;
}
