"use client";

import { useEffect, useRef, useState } from "react";
import { Factory, StaveNoteStruct } from "vexflow";

export interface SheetMusicRendererProps {
  notes: string[];
  noteDurations?: string[];
  clef?: "treble" | "bass" | "both";
  currentNoteIndex?: number;
  bpm?: number;
  className?: string;
}

function noteToVexFlow(note: string): string {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return "C/4";
  const name = match[1];
  const octave = parseInt(match[2], 10);
  return `${name}/${octave}`;
}

function durationToVex(duration: string): string {
  const map: Record<string, string> = {
    "1n": "w",
    "2n": "h",
    "4n": "q",
    "8n": "8",
    "16n": "16",
    "2": "h",
    "4": "q",
    "8": "8",
  };
  return map[duration] ?? "q";
}

export function SheetMusicRenderer({
  notes,
  noteDurations,
  clef = "treble",
  currentNoteIndex = -1,
  bpm = 90,
  className = "",
}: SheetMusicRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const factoryRef = useRef<Factory | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || containerWidth < 100) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const height = clef === "both" ? 300 : 180;
    const factory = new Factory({
      renderer: { elementId: "", width: containerWidth, height, backend: 4 },
    });
    factoryRef.current = factory;
    const ctx = factory.getContext();

    if (!ctx) return;

    const staveX = 40;
    const staveWidth = containerWidth - 80;
    const staveY = 40;

    if (clef === "both") {
      const trebleStave = factory.Stave({ x: staveX, y: staveY, width: staveWidth });
      trebleStave.addClef("treble");
      trebleStave.addTimeSignature("4/4");
      trebleStave.setContext(ctx);
      trebleStave.draw();

      const bassStave = factory.Stave({ x: staveX, y: staveY + 120, width: staveWidth });
      bassStave.addClef("bass");
      bassStave.addTimeSignature("4/4");
      bassStave.setContext(ctx);
      bassStave.draw();

      const connector = factory.StaveConnector({
        topStave: trebleStave,
        bottomStave: bassStave,
        type: 0,
      });
      connector.setContext(ctx);
      connector.draw();

      const bracket = factory.StaveConnector({
        topStave: trebleStave,
        bottomStave: bassStave,
        type: 3,
      });
      bracket.setContext(ctx);
      bracket.draw();
    } else {
      const stave = factory.Stave({ x: staveX, y: staveY, width: staveWidth });
      stave.addClef(clef === "bass" ? "bass" : "treble");
      stave.addTimeSignature("4/4");
      stave.setContext(ctx);
      stave.draw();
    }

    const vfNotes: StaveNoteStruct[] = notes.slice(0, 16).map((n, i) => ({
      keys: [noteToVexFlow(n)],
      duration: noteDurations ? durationToVex(noteDurations[i]) : "q",
      clef: clef === "both" ? (parseInt(n.match(/\d+/)?.[0] ?? "4", 10) < 4 ? "bass" : "treble") : clef,
    }));

    if (vfNotes.length > 0) {
      try {
        const voice = factory.Voice({ time: "4/4" });
        voice.addTickables(vfNotes as unknown as import("vexflow").Note[]);

        const formatter = factory.Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], staveWidth - 20);

        voice.draw(ctx, factory.getStave()!);
      } catch {
        // Silently handle rendering errors for invalid note data
      }
    }

    if (currentNoteIndex >= 0 && currentNoteIndex < notes.length && factory.getStave()) {
      const stave = factory.getStave()!;
      const x = stave.getX() + (currentNoteIndex + 1) * (staveWidth / Math.max(notes.length, 8));
      ctx.fillStyle = "rgba(251,191,36,0.3)";
      ctx.fillRect(x - 8, stave.getY(), 4, stave.getHeight());
    }

    return () => {
      factoryRef.current = null;
    };
  }, [notes, noteDurations, clef, currentNoteIndex, bpm, containerWidth]);

  return (
    <div
      ref={containerRef}
      className={`min-h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl ${className}`}
    />
  );
}
