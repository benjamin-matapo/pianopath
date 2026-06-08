"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface NoteDisplayProps {
  currentNote?: string | null;
  isNotePlaying?: boolean;
}

const BAR_COUNT = 6;

const SHORTCUT_MAPPINGS = [
  { key: "A", note: "C" },
  { key: "W", note: "C#" },
  { key: "S", note: "D" },
  { key: "E", note: "D#" },
  { key: "D", note: "E" },
  { key: "F", note: "F" },
  { key: "T", note: "F#" },
  { key: "G", note: "G" },
  { key: "Y", note: "G#" },
  { key: "H", note: "A" },
  { key: "U", note: "A#" },
  { key: "J", note: "B" },
  { key: "K", note: "C" },
];

export function NoteDisplay({ currentNote, isNotePlaying = false }: NoteDisplayProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowHint(true), 3000);
    return () => {
      clearTimeout(id);
      setShowHint(false);
    };
  }, [currentNote]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 backdrop-blur-xl sm:gap-6 sm:px-6 sm:py-4">
      <div className="flex w-28 items-center sm:w-32">
        <AnimatePresence mode="wait">
          {currentNote ? (
            <motion.span
              key={currentNote}
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.85 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-br from-white to-amber-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
            >
              {currentNote}
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-3xl font-bold tracking-tight text-zinc-700 sm:text-4xl"
            >
              —
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-8 flex-1 items-end justify-center gap-[3px] sm:h-10 sm:gap-[4px]">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            animate={
              isNotePlaying
                ? {
                    height: [
                      3,
                      14 + Math.sin(i * 1.5) * 12,
                      6,
                      18 + Math.sin(i * 1.5 + 2) * 10,
                      4,
                      16 + Math.sin(i * 1.5 + 4) * 14,
                      8,
                      12 + Math.sin(i * 1.5 + 1) * 8,
                      5,
                      20 + Math.sin(i * 1.5 + 3) * 12,
                    ],
                  }
                : { height: 3 }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
            style={{
              width: 6,
              borderRadius: 9999,
              backgroundColor: isNotePlaying ? "#fbbf24" : "#a1a1aa",
              boxShadow: isNotePlaying ? "0 0 6px rgba(251,191,36,0.4)" : undefined,
            }}
            className="sm:w-2"
          />
        ))}
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="hidden flex-shrink-0 sm:flex sm:flex-col"
          >
            <span className="mb-1 text-center text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
              Keys
            </span>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {SHORTCUT_MAPPINGS.map(({ key: k, note }) => (
                <span key={k} className="text-[11px] font-mono text-zinc-500">
                  <span className="font-semibold text-zinc-300">{k}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-zinc-400">{note}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
