"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { MicrophoneListener } from "@/components/piano/MicrophoneListener";
import { PianoKeyboard } from "@/components/piano/PianoKeyboard";

const SCALES = [
  { label: "C Major", notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] },
  { label: "G Major", notes: ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"] },
  { label: "D Major", notes: ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"] },
  { label: "C Blues", notes: ["C4", "D#4", "F4", "F#4", "G4", "A#4"] },
];

const CHORDS = [
  { label: "C Major", notes: ["C4", "E4", "G4"] },
  { label: "D Minor", notes: ["D4", "F4", "A4"] },
  { label: "G Major", notes: ["G3", "B3", "D4"] },
  { label: "F Major", notes: ["F3", "A3", "C4"] },
];

export default function PracticePage() {
  const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Practice</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Choose a scale or chord, then play along.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCALES.map((s) => (
          <button
            key={s.label}
            onClick={() =>
              setHighlightedNotes((prev) =>
                prev === s.notes ? [] : s.notes,
              )
            }
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              JSON.stringify(highlightedNotes) === JSON.stringify(s.notes)
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="px-2 text-zinc-700 text-xs self-center">|</span>
        {CHORDS.map((c) => (
          <button
            key={c.label}
            onClick={() =>
              setHighlightedNotes((prev) =>
                prev === c.notes ? [] : c.notes,
              )
            }
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              JSON.stringify(highlightedNotes) === JSON.stringify(c.notes)
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {micEnabled && (
        <MicrophoneListener
          onNoteDetected={(note) => console.log("Detected:", note)}
          className=""
        />
      )}

      {!micEnabled && (
        <button
          onClick={() => setMicEnabled(true)}
          className="rounded-xl border border-zinc-700 py-3 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
        >
          Enable Mic for Real-Time Feedback
        </button>
      )}

      <PianoKeyboard highlightedNotes={highlightedNotes} />
    </motion.div>
  );
}
