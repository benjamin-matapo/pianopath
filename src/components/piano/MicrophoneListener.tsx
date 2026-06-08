"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

import { usePitchDetection } from "@/hooks/usePitchDetection";

export interface MicrophoneListenerProps {
  targetNote?: string | null;
  onNoteDetected?: (note: string, cents: number) => void;
  onTargetMet?: (matched: boolean) => void;
  className?: string;
}

const NOTE_FREQ_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function MicrophoneListener({
  targetNote,
  onNoteDetected,
  onTargetMet,
  className = "",
}: MicrophoneListenerProps) {
  const {
    isRunning,
    isSupported,
    error,
    current,
    startDetection,
    stopDetection,
    targetNoteMet,
  } = usePitchDetection();

  function handleToggle() {
    if (isRunning) {
      stopDetection();
    } else {
      startDetection();
    }
  }

  const targetCheck = targetNote && current ? targetNoteMet(targetNote) : null;

  if (targetCheck && onTargetMet) {
    onTargetMet(targetCheck.matched);
  }

  if (current && onNoteDetected) {
    onNoteDetected(current.note, current.cents);
  }

  const needleRotation = current ? Math.max(-45, Math.min(45, current.cents * 0.9)) : 0;

  const matchedTarget = targetCheck?.matched ?? false;

  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            disabled={!isSupported}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              isRunning
                ? "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
            aria-label={isRunning ? "Stop microphone" : "Start microphone"}
          >
            {isRunning ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <div>
            <p className="text-sm font-medium text-zinc-300">Pitch Detection</p>
            <p className="text-xs text-zinc-500">
              {isRunning ? "Listening..." : error ?? "Tap to enable"}
            </p>
          </div>
        </div>

        {current && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={current.note}
            className={`rounded-lg border px-3 py-1 ${
              matchedTarget
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-200"
            }`}
          >
            <span className="font-mono text-lg font-bold">{current.note}</span>
            <span className="ml-1 text-xs text-zinc-500">{current.cents > 0 ? "+" : ""}{current.cents}¢</span>
          </motion.div>
        )}
      </div>

      {isRunning && (
        <div className="mt-4">
          <div className="relative mx-auto h-16 w-48">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-zinc-700" />

            <div
              className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-1"
            >
              {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                <div key={deg} className="flex flex-col items-center">
                  <div
                    className={`h-1.5 w-0.5 rounded-full ${
                      deg === 0 ? "bg-zinc-500" : "bg-zinc-700"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2"
              style={{
                background: `linear-gradient(to top, ${
                  matchedTarget ? "#34d399" : "#fbbf24"
                }, transparent)`,
              }}
            />

            <motion.div
              className="absolute bottom-0 h-3 w-3 -translate-x-1/2 rounded-full"
              style={{
                left: `calc(50% + ${needleRotation * (48 / 45)}px)`,
                backgroundColor: matchedTarget ? "#34d399" : "#fbbf24",
                boxShadow: `0 0 8px ${matchedTarget ? "rgba(52,211,153,0.5)" : "rgba(251,191,36,0.5)"}`,
              }}
              animate={{ left: `calc(50% + ${needleRotation * (48 / 45)}px)` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </div>

          <div className="mt-2 flex justify-center gap-1">
            {NOTE_FREQ_NAMES.map((n) => (
              <span
                key={n}
                className={`text-[10px] font-mono ${
                  current?.note.startsWith(n) ? "text-amber-400 font-semibold" : "text-zinc-700"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
