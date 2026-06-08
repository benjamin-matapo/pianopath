"use client";

import { useCallback, useRef, useState } from "react";
import * as Tone from "tone";

export function usePiano() {
  const [isLoaded, setIsLoaded] = useState(false);
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const initializedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fallbackToPolySynth() {
    samplerRef.current?.dispose();
    samplerRef.current = null;
    synthRef.current = new Tone.PolySynth().toDestination();
    initializedRef.current = true;
    setIsLoaded(true);
  }

  const startAudio = useCallback(async () => {
    if (initializedRef.current) return;

    await Tone.start();

    samplerRef.current = new Tone.Sampler({
      urls: {
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        initializedRef.current = true;
        setIsLoaded(true);
      },
      onerror: () => {
        fallbackToPolySynth();
      },
    }).toDestination();

    timeoutRef.current = setTimeout(() => {
      if (!initializedRef.current) {
        fallbackToPolySynth();
      }
    }, 8000);
  }, []);

  const startNote = useCallback((note: string) => {
    if (!initializedRef.current) return;
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
    } else if (samplerRef.current) {
      samplerRef.current.triggerAttack(note);
    }
  }, []);

  const stopNote = useCallback((note: string) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
    } else if (samplerRef.current) {
      samplerRef.current.triggerRelease(note);
    }
  }, []);

  const playNote = useCallback((note: string, duration?: string) => {
    if (!initializedRef.current) return;
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, duration ?? "8n");
    } else if (samplerRef.current) {
      samplerRef.current.triggerAttackRelease(note, duration ?? "8n");
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    samplerRef.current?.dispose();
    synthRef.current?.dispose();
    samplerRef.current = null;
    synthRef.current = null;
    initializedRef.current = false;
    setIsLoaded(false);
  }, []);

  return { isLoaded, startNote, stopNote, playNote, startAudio, cleanup };
}
