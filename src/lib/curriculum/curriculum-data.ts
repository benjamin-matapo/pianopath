import type { Lesson, Module } from "@/types/database";

export type LessonContentJson = {
  sections: LessonSection[];
};

export type LessonSection =
  | TheorySection
  | InteractiveSection
  | SongSection
  | ExerciseSection;

export interface TheorySection {
  type: "theory";
  title: string;
  body: string;
  imageHint?: string;
}

export interface InteractiveSection {
  type: "interactive";
  title: string;
  description: string;
  targetNotes: string[];
  highlights: string[];
  instructions: string;
}

export interface SongSection {
  type: "song";
  title: string;
  composer: string;
  notes: string[];
  noteDurations: string[];
  targetNotes: string[];
  bpm: number;
}

export interface ExerciseSection {
  type: "exercise";
  title: string;
  description: string;
  noteSequence: string[];
  targetNotes: string[];
  requiredAccuracy: number;
}

export interface ModuleWithLessons extends Module {
  lessons: LessonWithContent[];
}

export interface LessonWithContent extends Omit<Lesson, "content_json"> {
  content: LessonContentJson;
}

function mod(
  id: string,
  index: number,
  title: string,
  desc: string,
  color: string,
  icon: string,
): Module {
  return { id, title, description: desc, order_index: index, color_hex: color, icon_name: icon, created_at: "" };
}

function lesson(
  id: string,
  slug: string,
  title: string,
  desc: string,
  order: number,
  moduleId: string,
  diff: "beginner" | "intermediate" | "advanced" | "expert",
  mins: number,
  type: "theory" | "interactive" | "song" | "exercise",
  content: LessonContentJson,
): LessonWithContent {
  return {
    id,
    slug,
    title,
    description: desc,
    order_index: order,
    module_id: moduleId,
    difficulty: diff,
    estimated_minutes: mins,
    lesson_type: type,
    is_published: true,
    created_at: "",
    updated_at: "",
    content,
  };
}

export const CURRICULUM: ModuleWithLessons[] = [
  {
    ...mod("mod-1", 0, "Foundations", "Posture, hand position, note names, and basic rhythm",
      "#6366f1", "book-open"),
    lessons: [
      lesson("l-1-1", "welcome-to-piano", "Welcome to the Piano",
        "Learn about piano layout and proper posture",
        0, "mod-1", "beginner", 5, "theory", {
          sections: [
            { type: "theory", title: "The Piano Keyboard",
              body: "The piano keyboard is made up of white and black keys. White keys represent natural notes (A–G), while black keys represent sharps and flats. Find middle C — it is the C nearest the center of your keyboard, just left of a group of two black keys.",
              imageHint: "piano-layout" },
            { type: "theory", title: "Proper Posture",
              body: "Sit tall with your feet flat on the floor. Keep your wrists level with the keys, fingers curved as if holding a small ball. Relax your shoulders and keep your elbows slightly in front of your body.",
              imageHint: "posture" },
          ],
        }),
      lesson("l-1-2", "finding-middle-c", "Finding Middle C",
        "Locate middle C and play your first notes",
        1, "mod-1", "beginner", 8, "interactive", {
          sections: [
            { type: "interactive", title: "Find Middle C",
              description: "Press the C4 key (middle C) using your thumb (finger 1).",
              targetNotes: ["C4"], highlights: ["C4"],
              instructions: "Look for the C nearest the center of your keyboard. It is to the left of two black keys. Press it with your right thumb." },
            { type: "interactive", title: "Neighbors",
              description: "Play D4 and E4 — the white keys to the right of middle C.",
              targetNotes: ["D4", "E4"], highlights: ["D4", "E4"],
              instructions: "Using fingers 2 and 3, play D and E." },
          ],
        }),
      lesson("l-1-3", "cde-finger-exercise", "C-D-E Finger Exercise",
        "Build finger strength with a simple five-finger pattern",
        2, "mod-1", "beginner", 10, "exercise", {
          sections: [
            { type: "exercise", title: "Five-Finger Pattern",
              description: "Play C–D–E–F–G ascending and descending.",
              noteSequence: ["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"],
              targetNotes: ["C4", "D4", "E4", "F4", "G4"],
              requiredAccuracy: 0.7 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-2", 1, "Rhythm & Time", "Whole, half, and quarter notes; time signatures",
      "#a855f7", "metronome"),
    lessons: [
      lesson("l-2-1", "note-values", "Note Values",
        "Understand whole, half, and quarter notes",
        0, "mod-2", "beginner", 6, "theory", {
          sections: [
            { type: "theory", title: "Note Durations",
              body: "A whole note (𝅝) lasts four beats. A half note (𝅗𝅥) lasts two beats. A quarter note (♩) lasts one beat. In 4/4 time, there are four beats per measure.",
              imageHint: "note-values" },
            { type: "interactive", title: "Clap the Rhythm",
              description: "Clap along with a steady pulse. Each clap is one quarter note.",
              targetNotes: ["C4"], highlights: ["C4"],
              instructions: "Tap any key in time with the metronome." },
          ],
        }),
      lesson("l-2-2", "four-four-time", "Playing in 4/4 Time",
        "Play simple melodies in common time",
        1, "mod-2", "beginner", 10, "song", {
          sections: [
            { type: "song", title: "Hot Cross Buns", composer: "Traditional",
              notes: ["E4", "D4", "C4", "E4", "D4", "C4", "C4", "C4", "C4", "C4", "D4", "D4", "D4", "D4", "E4", "D4", "C4"],
              noteDurations: ["4n", "4n", "2n", "4n", "4n", "2n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "2n"],
              targetNotes: ["C4", "D4", "E4"], bpm: 90 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-3", 2, "Five-Finger Scales", "Major five-finger patterns in C, G, D, F",
      "#ec4899", "git-fork"),
    lessons: [
      lesson("l-3-1", "c-major-five", "C Major Five-Finger Pattern",
        "Learn the C major five-finger position",
        0, "mod-3", "beginner", 8, "interactive", {
          sections: [
            { type: "interactive", title: "C Position",
              description: "Place your right thumb on C4. Each finger plays the next white key.",
              targetNotes: ["C4", "D4", "E4", "F4", "G4"],
              highlights: ["C4", "D4", "E4", "F4", "G4"],
              instructions: "Play each note in sequence: C D E F G." },
          ],
        }),
      lesson("l-3-2", "g-major-five", "G Major Five-Finger Pattern",
        "Learn the G major five-finger position (F#)",
        1, "mod-3", "beginner", 8, "interactive", {
          sections: [
            { type: "interactive", title: "G Position",
              description: "Place your right thumb on G3. F is sharp (F#).",
              targetNotes: ["G3", "A3", "B3", "C4", "D4"],
              highlights: ["G3", "A3", "B3", "C4", "D4"],
              instructions: "Play G A B C D. Watch for F# if included in exercises." },
          ],
        }),
      lesson("l-3-3", "five-finger-review", "Five-Finger Review",
        "Practice both C and G patterns in sequence",
        2, "mod-3", "beginner", 10, "exercise", {
          sections: [
            { type: "exercise", title: "C and G Patterns",
              description: "Play C major then G major five-finger patterns.",
              noteSequence: ["C4", "D4", "E4", "F4", "G4", "G3", "A3", "B3", "C4", "D4"],
              targetNotes: ["C4", "D4", "E4", "F4", "G4", "G3", "A3", "B3", "C4", "D4"],
              requiredAccuracy: 0.65 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-4", 3, "Chords & Harmony", "Triads, major and minor chords, chord progressions",
      "#f97316", "layers"),
    lessons: [
      lesson("l-4-1", "what-is-a-chord", "What Is a Chord?",
        "Understand triads and how they are built",
        0, "mod-4", "intermediate", 6, "theory", {
          sections: [
            { type: "theory", title: "Building a Triad",
              body: "A triad is a three-note chord built of stacked thirds. The root note is the foundation, the third determines major or minor, and the fifth completes the chord. C major = C–E–G (root–major third–perfect fifth).",
              imageHint: "triad" },
            { type: "theory", title: "Major vs Minor",
              body: "A major chord has a major third (4 half steps from the root). A minor chord has a minor third (3 half steps). The difference gives major a bright sound and minor a sad sound.",
              imageHint: "major-minor" },
          ],
        }),
      lesson("l-4-2", "c-major-chord", "C Major Chord",
        "Play your first chord: C–E–G",
        1, "mod-4", "intermediate", 8, "interactive", {
          sections: [
            { type: "interactive", title: "C Major Triad",
              description: "Press C, E, and G simultaneously with fingers 1, 3, and 5.",
              targetNotes: ["C4", "E4", "G4"],
              highlights: ["C4", "E4", "G4"],
              instructions: "Use thumb (C), middle (E), and pinky (G). Press all three at once." },
          ],
        }),
      lesson("l-4-3", "chord-progression", "Chord Progression I–IV–V",
        "Play a I–IV–V progression in C major",
        2, "mod-4", "intermediate", 12, "song", {
          sections: [
            { type: "song", title: "I–IV–V Progression", composer: "Exercise",
              notes: ["C4", "E4", "G4", "F4", "A4", "C5", "G4", "B4", "D5"],
              noteDurations: ["2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n"],
              targetNotes: ["C4", "E4", "G4", "F4", "A4", "C5", "G4", "B4", "D5"],
              bpm: 80 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-5", 4, "Dynamics & Expression", "Fortepiano, crescendo, phrasing, articulation",
      "#10b981", "volume-2"),
    lessons: [
      lesson("l-5-1", "dynamics-basics", "Dynamics Basics",
        "Learn piano, forte, crescendo, decrescendo",
        0, "mod-5", "intermediate", 6, "theory", {
          sections: [
            { type: "theory", title: "Dynamic Markings",
              body: "Piano (p) = soft, Forte (f) = loud, Mezzo-piano (mp) = moderately soft, Mezzo-forte (mf) = moderately loud, Crescendo (<) = gradually louder, Decrescendo (>) = gradually softer.",
              imageHint: "dynamics" },
          ],
        }),
      lesson("l-5-2", "loud-and-soft", "Loud and Soft",
        "Practice playing the same phrase at different dynamic levels",
        1, "mod-5", "intermediate", 10, "exercise", {
          sections: [
            { type: "exercise", title: "Dynamic Contrast",
              description: "Play C–D–E–F–G at piano, then forte.",
              noteSequence: ["C4", "D4", "E4", "F4", "G4", "C4", "D4", "E4", "F4", "G4"],
              targetNotes: ["C4", "D4", "E4", "F4", "G4"],
              requiredAccuracy: 0.6 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-6", 5, "Scales & Key Signatures", "One-octave major scales, key sigs, circle of fifths",
      "#06b6d4", "music"),
    lessons: [
      lesson("l-6-1", "c-major-scale", "C Major Scale",
        "Play a one-octave C major scale ascending and descending",
        0, "mod-6", "intermediate", 10, "interactive", {
          sections: [
            { type: "interactive", title: "C Major Scale",
              description: "Play C D E F G A B C ascending, then reverse.",
              targetNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
              highlights: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
              instructions: "Use a steady tempo. Thumb tucks under after G to reach A." },
          ],
        }),
      lesson("l-6-2", "g-major-scale", "G Major Scale",
        "Play a one-octave G major scale (F#)",
        1, "mod-6", "intermediate", 10, "interactive", {
          sections: [
            { type: "interactive", title: "G Major Scale",
              description: "G A B C D E F# G — notice F#.",
              targetNotes: ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
              highlights: ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
              instructions: "Pay attention to F# — it is the black key in the group of three." },
          ],
        }),
    ],
  },
  {
    ...mod("mod-7", 6, "Repertoire", "Classical and modern pieces: Ode to Joy, Amazing Grace",
      "#8b5cf6", "album"),
    lessons: [
      lesson("l-7-1", "ode-to-joy", "Ode to Joy",
        "Learn Beethoven's Ode to Joy melody",
        0, "mod-7", "advanced", 15, "song", {
          sections: [
            { type: "song", title: "Ode to Joy", composer: "Ludwig van Beethoven",
              notes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4", "C4", "C4", "D4", "E4", "E4", "D4", "D4"],
              noteDurations: ["4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "4n", "2n"],
              targetNotes: ["C4", "D4", "E4", "F4", "G4"], bpm: 100 },
          ],
        }),
      lesson("l-7-2", "amazing-grace", "Amazing Grace",
        "Learn the hymn Amazing Grace",
        1, "mod-7", "advanced", 15, "song", {
          sections: [
            { type: "song", title: "Amazing Grace", composer: "John Newton / Traditional",
              notes: ["G3", "G3", "A3", "B3", "C4", "C4", "D4", "C4", "B3", "A3", "G3", "A3", "B3", "B3", "A3", "G3"],
              noteDurations: ["4n", "4n", "4n", "4n", "2n", "4n", "4n", "4n", "4n", "4n", "2n", "4n", "4n", "4n", "4n", "2n"],
              targetNotes: ["G3", "A3", "B3", "C4", "D4"], bpm: 90 },
          ],
        }),
    ],
  },
  {
    ...mod("mod-8", 7, "Styles & Creativity", "Blues, pop, improvisation, lead sheets",
      "#f43f5e", "sparkles"),
    lessons: [
      lesson("l-8-1", "blues-scale", "The Blues Scale",
        "Learn the blues scale and improvise",
        0, "mod-8", "expert", 12, "interactive", {
          sections: [
            { type: "interactive", title: "C Blues Scale",
              description: "C–Eb–F–F#–G–Bb–C — the six-note blues scale.",
              targetNotes: ["C4", "D#4", "F4", "F#4", "G4", "A#4"],
              highlights: ["C4", "D#4", "F4", "F#4", "G4", "A#4"],
              instructions: "Play each note slowly. The flat third, flat fifth, and flat seventh give the blues its distinctive sound." },
          ],
        }),
      lesson("l-8-2", "pop-chord-progression", "Pop Chord Progression I–V–vi–IV",
        "Play the most common pop chord progression",
        1, "mod-8", "expert", 12, "song", {
          sections: [
            { type: "song", title: "Pop Progression", composer: "Exercise",
              notes: ["C4", "E4", "G4", "G4", "B4", "D5", "A4", "C5", "E5", "F4", "A4", "C5"],
              noteDurations: ["2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n", "2n"],
              targetNotes: ["C4", "E4", "G4", "A4", "C5", "E5", "F4", "A4", "C5", "G4", "B4", "D5"],
              bpm: 100 },
          ],
        }),
    ],
  },
];

export function getModuleBySlug(slug: string): ModuleWithLessons | undefined {
  return CURRICULUM.find((m) => m.id === slug || m.title.toLowerCase().replace(/\s+/g, "-") === slug);
}

export function getLessonBySlug(slug: string): LessonWithContent | undefined {
  for (const mod of CURRICULUM) {
    const lesson = mod.lessons.find((l) => l.slug === slug);
    if (lesson) return lesson;
  }
  return undefined;
}
