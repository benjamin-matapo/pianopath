"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Music, Target } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MicrophoneListener } from "@/components/piano/MicrophoneListener";
import { PianoKeyboard } from "@/components/piano/PianoKeyboard";
import { getLessonBySlug } from "@/lib/curriculum/curriculum-data";
import type { InteractiveSection, LessonSection, SongSection } from "@/lib/curriculum/curriculum-data";

interface LessonPlayerProps {
  slug: string;
}

export function LessonPlayer({ slug }: LessonPlayerProps) {
  const lesson = useMemo(() => getLessonBySlug(slug), [slug]);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [micEnabled, setMicEnabled] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
  const targetNotesRef = useRef<Set<string>>(new Set());

  if (!lesson) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-500">Lesson not found.</p>
      </div>
    );
  }

  const sections = lesson.content.sections;
  const section = sections[currentSection];
  if (!section) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-500">No sections found.</p>
      </div>
    );
  }

  function handleNext() {
    if (currentSection < sections.length - 1) {
      setCurrentSection((p) => p + 1);
    }
  }

  function handlePrev() {
    if (currentSection > 0) {
      setCurrentSection((p) => p - 1);
    }
  }

  function handleSectionComplete() {
    setCompletedSections((prev) => new Set(prev).add(currentSection));
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{lesson.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{lesson.description}</p>
        </div>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
          {currentSection + 1} / {sections.length}
        </span>
      </div>

      <div className="flex gap-1">
        {sections.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSection(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              completedSections.has(i)
                ? "bg-emerald-500"
                : i === currentSection
                  ? "bg-amber-500"
                  : "bg-zinc-700"
            }`}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      <SectionRenderer
        section={section}
        highlightedNotes={highlightedNotes}
        setHighlightedNotes={setHighlightedNotes}
        activeNotes={activeNotes}
        setActiveNotes={setActiveNotes}
        targetNotesRef={targetNotesRef}
        micEnabled={micEnabled}
        setMicEnabled={setMicEnabled}
        onComplete={handleSectionComplete}
      />

      <div className="flex justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentSection === 0}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {completedSections.has(currentSection) && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 text-emerald-400 text-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </motion.div>
        )}

        <button
          onClick={handleNext}
          disabled={currentSection === sections.length - 1}
          className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentSection === sections.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  highlightedNotes,
  setHighlightedNotes,
  activeNotes,
  setActiveNotes,
  targetNotesRef,
  micEnabled,
  setMicEnabled,
  onComplete,
}: {
  section: LessonSection;
  highlightedNotes: string[];
  setHighlightedNotes: (notes: string[]) => void;
  activeNotes: string[];
  setActiveNotes: (notes: string[]) => void;
  targetNotesRef: React.MutableRefObject<Set<string>>;
  micEnabled: boolean;
  setMicEnabled: (enabled: boolean) => void;
  onComplete: () => void;
}) {
  const [exerciseStep, setExerciseStep] = useState(0);

  useEffect(() => {
    if (section.type === "interactive" || section.type === "exercise") {
      const s = section as InteractiveSection;
      setHighlightedNotes(s.highlights ?? s.targetNotes);
      targetNotesRef.current = new Set(s.targetNotes);
    }
    if (section.type === "song") {
      const s = section as SongSection;
      setActiveNotes(s.targetNotes);
    }
    return () => {
      setHighlightedNotes([]);
      setActiveNotes([]);
      targetNotesRef.current = new Set();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  if (section.type === "theory") {
    return (
      <motion.div
        key={section.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl"
      >
        <h2 className="text-lg font-semibold text-white">{section.title}</h2>
        <p className="leading-relaxed text-zinc-300">{section.body}</p>
        {section.imageHint && (
          <div className="flex items-center justify-center rounded-xl bg-zinc-800/50 py-12">
            <Music className="h-8 w-8 text-zinc-600" />
            <span className="ml-2 text-sm text-zinc-600">{section.imageHint}</span>
          </div>
        )}
        <button
          onClick={onComplete}
          className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Mark as Read
        </button>
      </motion.div>
    );
  }

  if (section.type === "interactive") {
    return (
      <motion.div
        key={section.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{section.description}</p>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{section.instructions}</span>
          </div>
        </div>

        {micEnabled && (
          <MicrophoneListener
            targetNote={section.targetNotes[0] ?? null}
            onNoteDetected={() => {}}
            onTargetMet={(matched) => {
              if (matched) onComplete();
            }}
          />
        )}

        <PianoKeyboard
          highlightedNotes={section.highlights ?? section.targetNotes}
          activeNotes={activeNotes}
          onNotePlay={(note) => {
            if (targetNotesRef.current.has(note)) {
              onComplete();
            }
          }}
        />

        {!micEnabled && (
          <button
            onClick={() => setMicEnabled(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
          >
            <Loader2 className="h-4 w-4" />
            Enable Mic Detection
          </button>
        )}
      </motion.div>
    );
  }

  if (section.type === "song") {
    return (
      <motion.div
        key={section.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="text-sm text-zinc-400">{section.composer}</p>
            </div>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
              ♩ = {section.bpm}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {section.notes.map((n, i) => (
              <span
                key={i}
                className={`rounded px-2 py-0.5 text-xs font-mono ${
                  i % 4 === 0 ? "bg-zinc-800 text-zinc-300" : "bg-zinc-800/50 text-zinc-500"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        <PianoKeyboard
          highlightedNotes={section.targetNotes}
          activeNotes={section.targetNotes}
          onNotePlay={(note) => {
            if (targetNotesRef.current.has(note)) {
              onComplete();
            }
          }}
        />
      </motion.div>
    );
  }

  if (section.type === "exercise") {
    const exerciseSection = section as import("@/lib/curriculum/curriculum-data").ExerciseSection;

    const currentTarget = exerciseSection.noteSequence[exerciseStep] ?? null;

    function handleNotePlay(note: string) {
      if (note === currentTarget) {
        if (exerciseStep >= exerciseSection.noteSequence.length - 1) {
          onComplete();
          setExerciseStep(0);
        } else {
          setExerciseStep((p) => p + 1);
        }
      }
    }

    return (
      <motion.div
        key={section.title}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{exerciseSection.title}</h2>
              <p className="text-sm text-zinc-400">{exerciseSection.description}</p>
            </div>
            <span className="text-sm text-zinc-500">
              {exerciseStep + 1} / {exerciseSection.noteSequence.length}
            </span>
          </div>

          <div className="mt-4 flex gap-1.5">
            {exerciseSection.noteSequence.map((n, i) => (
              <span
                key={i}
                className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
                  i < exerciseStep
                    ? "bg-emerald-500/20 text-emerald-400"
                    : i === exerciseStep
                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                      : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {n}
              </span>
            ))}
          </div>

          {currentTarget && (
            <div className="mt-3 rounded-lg bg-zinc-800/50 px-4 py-2 text-center">
              <span className="text-sm text-zinc-400">Play: </span>
              <span className="font-mono text-lg font-bold text-amber-400">{currentTarget}</span>
            </div>
          )}
        </div>

        <PianoKeyboard
          highlightedNotes={exerciseSection.targetNotes}
          onNotePlay={handleNotePlay}
        />
      </motion.div>
    );
  }

  return null;
}
