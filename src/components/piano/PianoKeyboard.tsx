"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePiano } from "@/hooks/usePiano";
import { NoteDisplay } from "@/components/piano/NoteDisplay";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const WHITE_KEYBOARD_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k"] as const;
const BLACK_KEYBOARD_KEYS = ["w", "e", "t", "y", "u"] as const;

interface Note {
  name: string;
  octave: number;
  isBlack: boolean;
  fullName: string;
}

export interface PianoKeyboardProps {
  startOctave?: number;
  octaves?: number;
  onNotePlay?: (note: string) => void;
  highlightedNotes?: string[];
  activeNotes?: string[];
}

function generateNotes(startOctave: number, octaves: number): Note[] {
  const notes: Note[] = [];
  for (let o = startOctave; o < startOctave + octaves; o++) {
    for (const name of NOTE_NAMES) {
      notes.push({
        name,
        octave: o,
        isBlack: name.includes("#"),
        fullName: `${name}${o}`,
      });
    }
  }
  return notes;
}

function buildKeyToNoteMap(notes: Note[]): Record<string, string> {
  const map: Record<string, string> = {};
  const whiteNoteIndex: Record<number, string> = {};
  let whiteIdx = 0;

  for (const note of notes) {
    if (!note.isBlack) {
      whiteNoteIndex[whiteIdx] = note.fullName;
      whiteIdx++;
    }
  }

  WHITE_KEYBOARD_KEYS.forEach((key, i) => {
    if (whiteNoteIndex[i]) {
      map[key] = whiteNoteIndex[i];
    }
  });

  let blackIdx = 0;
  for (const note of notes) {
    if (note.isBlack) {
      if (BLACK_KEYBOARD_KEYS[blackIdx]) {
        map[BLACK_KEYBOARD_KEYS[blackIdx]] = note.fullName;
        blackIdx++;
      }
    }
  }

  return map;
}

export function PianoKeyboard({
  startOctave = 3,
  octaves = 2,
  onNotePlay,
  highlightedNotes,
  activeNotes,
}: PianoKeyboardProps) {
  const { isLoaded, startNote, stopNote, startAudio } = usePiano();
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const pressedNotesRef = useRef<Set<string>>(new Set());
  const clearNoteTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isNotePlaying = pressedNotes.size > 0;

  const notes = useMemo(() => generateNotes(startOctave, octaves), [startOctave, octaves]);
  const whiteKeys = useMemo(() => notes.filter((n) => !n.isBlack), [notes]);
  const blackKeys = useMemo(() => notes.filter((n) => n.isBlack), [notes]);
  const keyToNote = useMemo(() => buildKeyToNoteMap(notes), [notes]);

  const totalWhiteKeys = whiteKeys.length;

  const getBlackKeyLeft = useCallback(
    (note: Note): string => {
      const whiteKeyIndex = notes.indexOf(note);
      const precedingWhiteCount = notes.slice(0, whiteKeyIndex).filter((n) => !n.isBlack).length;
      const percent = (precedingWhiteCount + 0.7) * (100 / totalWhiteKeys);
      return `${percent}%`;
    },
    [notes, totalWhiteKeys],
  );

  const handleNoteOn = useCallback(
    (note: string) => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        startAudio();
      }

      if (clearNoteTimerRef.current) {
        clearTimeout(clearNoteTimerRef.current);
      }
      setCurrentNote(note);

      pressedNotesRef.current = new Set(pressedNotesRef.current).add(note);
      setPressedNotes(new Set(pressedNotesRef.current));
      startNote(note);
      onNotePlay?.(note);
    },
    [startAudio, startNote, onNotePlay],
  );

  const handleNoteOff = useCallback(
    (note: string) => {
      pressedNotesRef.current = new Set(pressedNotesRef.current);
      pressedNotesRef.current.delete(note);
      setPressedNotes(new Set(pressedNotesRef.current));

      if (pressedNotesRef.current.size === 0) {
        clearNoteTimerRef.current = setTimeout(() => {
          setCurrentNote(null);
        }, 400);
      }

      stopNote(note);
    },
    [stopNote],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const note = keyToNote[e.key.toLowerCase()];
      if (note && !pressedNotesRef.current.has(note)) {
        handleNoteOn(note);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const note = keyToNote[e.key.toLowerCase()];
      if (note) {
        handleNoteOff(note);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyToNote, handleNoteOn, handleNoteOff]);

  return (
    <div className="relative select-none space-y-3" role="region" aria-label="Piano keyboard">
      <NoteDisplay currentNote={currentNote} isNotePlaying={isNotePlaying} />
      <div className="overflow-x-auto pb-2" style={{ touchAction: "manipulation" }}>
        <div className="relative flex min-w-[560px]">
          {whiteKeys.map((key) => {
            const isPressed = pressedNotes.has(key.fullName);
            const isHighlighted = highlightedNotes?.includes(key.fullName) ?? false;
            const isActive = activeNotes?.includes(key.fullName) ?? false;

            return (
              <motion.div
                key={key.fullName}
                className="relative flex-1 cursor-pointer"
                onMouseDown={() => handleNoteOn(key.fullName)}
                onMouseUp={() => handleNoteOff(key.fullName)}
                onMouseLeave={() => {
                  if (pressedNotesRef.current.has(key.fullName)) {
                    handleNoteOff(key.fullName);
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNoteOn(key.fullName);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteOff(key.fullName);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  handleNoteOff(key.fullName);
                }}
                animate={{
                  y: isPressed ? 2 : 0,
                  backgroundColor: isPressed ? "#6366f1" : isActive ? "#a5b4fc" : "#f4f4f5",
                }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                style={{
                  height: 180,
                  border: "1px solid #d4d4d8",
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                  boxShadow: isHighlighted
                    ? "inset 0 0 0 2px #22c55e, 0 0 12px rgba(34,197,94,0.5)"
                    : "inset 0 -2px 4px rgba(0,0,0,0.1)",
                }}
              />
            );
          })}
        </div>

        {blackKeys.map((key) => {
          const isPressed = pressedNotes.has(key.fullName);
          const isHighlighted = highlightedNotes?.includes(key.fullName) ?? false;
          const isActive = activeNotes?.includes(key.fullName) ?? false;

          return (
            <motion.div
              key={key.fullName}
              className="absolute z-10 cursor-pointer"
              style={{
                left: getBlackKeyLeft(key),
                width: `calc((100% - ${totalWhiteKeys - 1}px) / ${totalWhiteKeys} * 0.6)`,
                height: 108,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                boxShadow: isHighlighted
                  ? "0 0 0 2px #22c55e, 0 0 12px rgba(34,197,94,0.5)"
                  : "0 3px 6px rgba(0,0,0,0.3)",
              }}
              onMouseDown={() => handleNoteOn(key.fullName)}
              onMouseUp={() => handleNoteOff(key.fullName)}
              onMouseLeave={() => {
                if (pressedNotesRef.current.has(key.fullName)) {
                  handleNoteOff(key.fullName);
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleNoteOn(key.fullName);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNoteOff(key.fullName);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                handleNoteOff(key.fullName);
              }}
              animate={{
                y: isPressed ? 2 : 0,
                backgroundColor: isPressed ? "#9333ea" : isActive ? "#a78bfa" : "#18181b",
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          );
        })}
      </div>

      {!isLoaded && (
        <div className="absolute inset-x-0 -bottom-6 text-center text-xs text-zinc-500">
          Loading audio engine...
        </div>
      )}
    </div>
  );
}
