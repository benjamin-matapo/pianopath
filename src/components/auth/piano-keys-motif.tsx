"use client";

import { motion } from "framer-motion";

const WHITE_KEYS = 14;
const BLACK_KEY_OFFSETS = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];

export function PianoKeysMotif() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-48 overflow-hidden opacity-40"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-1/2 flex h-36 -translate-x-1/2 gap-px px-4">
        {Array.from({ length: WHITE_KEYS }).map((_, index) => (
          <motion.div
            key={`white-${index}`}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{
              delay: 0.05 * index,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative h-full w-8 origin-bottom rounded-t-sm bg-gradient-to-b from-zinc-100 to-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            {BLACK_KEY_OFFSETS.includes(index) && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: 0.08 * index + 0.2,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute -right-2.5 top-0 z-10 h-[58%] w-5 origin-top rounded-b-sm bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-lg"
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl"
      />
    </div>
  );
}
