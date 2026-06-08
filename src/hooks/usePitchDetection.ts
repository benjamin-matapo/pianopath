"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { computeYin, type YinResult } from "@/lib/pitch-detection/yin";

export interface PitchDetectionState {
  isRunning: boolean;
  isSupported: boolean;
  error: string | null;
  current: YinResult | null;
  stream: MediaStream | null;
}

const DEBOUNCE_MS = 80;
const SAMPLE_RATE = 44100;
const FFT_SIZE = 2048;
const YIN_CONFIG = {
  sampleRate: SAMPLE_RATE,
  threshold: 0.1,
  minFreq: 65,
  maxFreq: 2093,
  probabilityThreshold: 0.08,
};

export function usePitchDetection() {
  const [state, setState] = useState<PitchDetectionState>({
    isRunning: false,
    isSupported: true,
    error: null,
    current: null,
    stream: null,
  });

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const lastDetectTimeRef = useRef(0);
  const lastResultRef = useRef<YinResult | null>(null);

  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current = null;
    stateRef.current.stream?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      error: null,
      current: null,
      stream: null,
    }));
    lastResultRef.current = null;
  }, []);

  const startDetection = useCallback(async () => {
    if (stateRef.current.isRunning) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      setState((prev) => ({
        ...prev,
        isRunning: true,
        error: null,
        stream,
      }));

      const bufferLength = analyser.frequencyBinCount;
      const timeDomain = new Float32Array(bufferLength);

      function detect() {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(timeDomain);

        const now = performance.now();
        if (now - lastDetectTimeRef.current >= DEBOUNCE_MS) {
          lastDetectTimeRef.current = now;

          const result = computeYin(timeDomain, YIN_CONFIG);
          if (result) {
            lastResultRef.current = result;
            setState((prev) => ({ ...prev, current: result }));
          } else if (lastResultRef.current) {
            const timeSinceLast = now - lastDetectTimeRef.current;
            if (timeSinceLast > 300) {
              lastResultRef.current = null;
              setState((prev) => ({ ...prev, current: null }));
            }
          }
        }

        rafRef.current = requestAnimationFrame(detect);
      }

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      const message =
        err instanceof DOMException
          ? "Microphone access denied. Please allow microphone permissions."
          : "Failed to start pitch detection.";
      setState((prev) => ({ ...prev, error: message, isRunning: false, isSupported: false }));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  const targetNoteMet = useCallback(
    (targetNote: string): { matched: boolean; centsOff: number } => {
      const current = lastResultRef.current ?? stateRef.current.current;
      if (!current) return { matched: false, centsOff: Infinity };
      const isMatch = current.note === targetNote;
      return { matched: isMatch && Math.abs(current.cents) < 25, centsOff: current.cents };
    },
    [],
  );

  return { ...state, startDetection, stopDetection, targetNoteMet };
}
