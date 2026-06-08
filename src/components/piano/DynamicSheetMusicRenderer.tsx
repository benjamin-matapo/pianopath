"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { SheetMusicRendererProps } from "./SheetMusicRenderer";

const SheetMusicRendererInner = dynamic(
  () => import("./SheetMusicRenderer").then((mod) => ({ default: mod.SheetMusicRenderer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    ),
  },
);

export function DynamicSheetMusicRenderer(props: SheetMusicRendererProps) {
  return <SheetMusicRendererInner {...props} />;
}
