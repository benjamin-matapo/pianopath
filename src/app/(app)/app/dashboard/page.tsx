"use client";

import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  LogIn,
  Music,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { useUser } from "@/hooks/useUser";
import { CURRICULUM } from "@/lib/curriculum/curriculum-data";
import type { ModuleWithLessons } from "@/lib/curriculum/curriculum-data";
import { useProgressStore } from "@/store/progress-store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const MODULE_ICONS: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  metronome: Music,
  "git-fork": Award,
  layers: Sparkles,
  "volume-2": Music,
  music: Music,
  album: Star,
  sparkles: Sparkles,
};

const MODULE_GRADIENTS: Record<string, string> = {
  "mod-1": "from-indigo-500/20 to-indigo-600/5",
  "mod-2": "from-purple-500/20 to-purple-600/5",
  "mod-3": "from-pink-500/20 to-pink-600/5",
  "mod-4": "from-orange-500/20 to-orange-600/5",
  "mod-5": "from-emerald-500/20 to-emerald-600/5",
  "mod-6": "from-cyan-500/20 to-cyan-600/5",
  "mod-7": "from-violet-500/20 to-violet-600/5",
  "mod-8": "from-rose-500/20 to-rose-600/5",
};

function getDayLabel(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function generateHeatmapData(): { label: string; active: boolean; intensity: number }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const active = i < 3 || (i === 3 && new Date().getHours() > 12);
    const intensity = active ? (dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 0.5) : 0;
    result.push({ label: i === 0 ? "Today" : getDayLabel(d), active, intensity });
  }
  return result;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br ${accent} p-4 backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon className="h-5 w-5 text-zinc-300" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ModuleCard({ mod, index }: { mod: ModuleWithLessons; index: number }) {
  const Icon = MODULE_ICONS[mod.icon_name] ?? BookOpen;
  const gradient = MODULE_GRADIENTS[mod.id] ?? "from-zinc-500/20 to-zinc-600/5";
  const progress = Math.floor(((index + 1) * 17 + mod.lessons.length * 3) % 60);

  return (
    <motion.a
      href={`/app/lessons/${mod.lessons[0]?.slug ?? "#"}`}
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className={`group relative flex w-full flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br ${gradient} p-4 backdrop-blur-xl transition-all hover:border-white/[0.15] sm:w-48`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
          <Icon className="h-4 w-4 text-zinc-300" />
        </div>
        <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
          Module {index + 1}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white">{mod.title}</h3>
      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{mod.description}</p>

      <div className="mt-auto pt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-zinc-600">{progress}%</span>
          <span className="text-zinc-600">{mod.lessons.length} lessons</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          />
        </div>
      </div>

      <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
    </motion.a>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const xpPoints = useProgressStore((s) => s.xpPoints);
  const currentStreak = useProgressStore((s) => s.currentStreak);
  const lessonProgress = useProgressStore((s) => s.lessonProgress);
  const heatmap = useMemo(() => generateHeatmapData(), []);
  const isGuest = !user;
  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Pianist";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:gap-8 sm:p-8"
    >
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.12)_0%,_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,191,36,0.08)_0%,_transparent_55%)]" />

        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-400/90">
                {getGreeting()}
              </p>
              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {isGuest ? "Guest 🎹" : displayName}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {isGuest ? "Start playing right away — no account needed" : "Ready for today&apos;s practice?"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isGuest ? (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 hover:text-amber-300"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Sync Progress
                </Link>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2">
                    <Flame className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-lg font-bold text-amber-400">{currentStreak}</p>
                      <p className="text-[10px] text-amber-500/80">day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2">
                    <Zap className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-lg font-bold text-indigo-400">{xpPoints.toLocaleString()}</p>
                      <p className="text-[10px] text-indigo-500/80">XP</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Flame} label="Current Streak" value={isGuest ? `${currentStreak} day` : `${currentStreak} days`} accent="from-orange-500/10 to-orange-600/5" />
        <StatCard icon={Star} label="Lessons Done" value={Object.values(lessonProgress).filter((s) => s === "completed").length} accent="from-amber-500/10 to-amber-600/5" />
        <StatCard icon={Award} label="Achievements" value={3} accent="from-indigo-500/10 to-indigo-600/5" />
        <StatCard icon={Music} label="Minutes Today" value={18} accent="from-emerald-500/10 to-emerald-600/5" />
      </div>

      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Journey</h2>
          <a
            href="/app/practice"
            className="text-xs font-medium text-amber-400/80 transition hover:text-amber-300"
          >
            View all →
          </a>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-2">
          {CURRICULUM.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">This Week</h2>
          <span className="text-xs text-zinc-600">5 of 7 days active</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          {heatmap.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: day.active ? day.intensity : 0.08 }}
                className="w-full origin-bottom rounded-lg transition-colors"
                style={{
                  height: 48,
                  backgroundColor: day.active
                    ? `rgba(251,191,36,${day.intensity})`
                    : "rgba(113,113,122,0.15)",
                }}
              />
              <span className="text-[10px] text-zinc-600">{day.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
