const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export interface YinResult {
  frequency: number;
  note: string;
  midi: number;
  cents: number;
  clarity: number;
}

export interface YinConfig {
  sampleRate: number;
  threshold?: number;
  minFreq?: number;
  maxFreq?: number;
  probabilityThreshold?: number;
}

export function frequencyToNote(freq: number): { note: string; midi: number; cents: number } {
  if (freq <= 0) return { note: "C0", midi: 12, cents: 0 };

  const midi = 12 * Math.log2(freq / 440) + 69;
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const octave = Math.floor(rounded / 12);
  const noteIndex = rounded % 12;
  const note = `${NOTE_NAMES[noteIndex]}${octave}`;

  return { note, midi: rounded, cents };
}

export function noteNameToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 69;
  const name = match[1] as (typeof NOTE_NAMES)[number];
  const octave = parseInt(match[2], 10);
  const index = NOTE_NAMES.indexOf(name);
  return (octave + 1) * 12 + index;
}

const FFT_PEAKS = [
  27.5, 29.135, 30.868, 32.703, 34.648, 36.708, 38.891, 41.203, 43.654, 46.249, 48.999, 51.913,
  55.0, 58.27, 61.735, 65.406, 69.296, 73.416, 77.782, 82.407, 87.307, 92.499, 97.999, 103.826,
  110.0, 116.541, 123.471, 130.813, 138.591, 146.832, 155.563, 164.814, 174.614, 184.997, 195.998,
  207.652, 220.0, 233.082, 246.942, 261.626, 277.183, 293.665, 311.127, 329.628, 349.228, 369.994,
  391.995, 415.305, 440.0, 466.164, 493.883, 523.251, 554.365, 587.33, 622.254, 659.255, 698.456,
  739.989, 783.991, 830.609, 880.0, 932.328, 987.767, 1046.502, 1108.731, 1174.659, 1244.508,
  1318.51, 1396.913, 1479.978, 1567.982, 1661.219, 1760.0, 1864.655, 1975.533, 2093.005, 2217.461,
  2349.318, 2489.016, 2637.02, 2793.826, 2959.955, 3135.963, 3322.438, 3520.0, 3729.31, 3951.066,
  4186.009,
];

function differenceFunction(buffer: Float32Array, tauMax: number): Float32Array {
  const len = buffer.length;
  const df = new Float32Array(tauMax);
  for (let tau = 0; tau < tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < len - tauMax; i++) {
      const diff = buffer[i] - buffer[i + tau];
      sum += diff * diff;
    }
    df[tau] = sum;
  }
  return df;
}

function cumulativeMeanNormalizedDifferenceFunction(
  df: Float32Array,
): Float32Array {
  const len = df.length;
  const cmndf = new Float32Array(len);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < len; tau++) {
    runningSum += df[tau];
    cmndf[tau] = runningSum > 0 ? df[tau] * tau / runningSum : 1;
  }
  return cmndf;
}

function absoluteThreshold(
  cmndf: Float32Array,
  threshold: number,
): number {
  const len = cmndf.length;
  for (let tau = 2; tau < len; tau++) {
    if (cmndf[tau] < threshold) {
      while (tau + 1 < len && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      return tau;
    }
  }
  return -1;
}

function parabolicInterpolation(
  cmndf: Float32Array,
  tau: number,
): number {
  const len = cmndf.length;
  if (tau < 1 || tau >= len - 1) return tau;
  const x0 = tau - 1;
  const x1 = tau;
  const x2 = tau + 1;
  const y0 = cmndf[x0];
  const y1 = cmndf[x1];
  const y2 = cmndf[x2];
  const denom = 2 * (2 * y1 - y2 - y0);
  if (Math.abs(denom) < 1e-12) return tau;
  const correction = (y2 - y0) / denom;
  return x1 + correction;
}

function findClosestPitch(freq: number): number {
  let closest = FFT_PEAKS[0];
  let minDiff = Math.abs(freq - closest);
  for (let i = 1; i < FFT_PEAKS.length; i++) {
    const diff = Math.abs(freq - FFT_PEAKS[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = FFT_PEAKS[i];
      if (diff < 0.5) break;
    }
  }
  return closest;
}

export function computeYin(
  buffer: Float32Array,
  config: YinConfig,
): YinResult | null {
  const {
    sampleRate,
    threshold = 0.1,
    minFreq = 65,
    maxFreq = 2093,
    probabilityThreshold = 0.1,
  } = config;

  const tauMax = Math.floor(sampleRate / minFreq);
  const tauMin = Math.ceil(sampleRate / maxFreq);

  if (buffer.length < tauMax) return null;

  const df = differenceFunction(buffer, tauMax);
  const cmndf = cumulativeMeanNormalizedDifferenceFunction(df);

  let tau = absoluteThreshold(cmndf, threshold);

  if (tau === -1) {
    tau = cmndf.indexOf(Math.min(...cmndf));
  }

  if (tau < tauMin) return null;

  const tauInterpolated = parabolicInterpolation(cmndf, tau);
  const frequency = sampleRate / tauInterpolated;

  if (frequency < minFreq || frequency > maxFreq) return null;

  const clarity = 1 - cmndf[tau];

  if (clarity < probabilityThreshold) return null;

  const closestFreq = findClosestPitch(frequency);
  const { note, midi, cents } = frequencyToNote(closestFreq);

  return { frequency: closestFreq, note, midi, cents, clarity };
}

export function downsample(buffer: Float32Array, targetRate: number, originalRate: number): Float32Array {
  const ratio = originalRate / targetRate;
  const newLength = Math.floor(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIdx = Math.floor(i * ratio);
    result[i] = buffer[srcIdx];
  }
  return result;
}
