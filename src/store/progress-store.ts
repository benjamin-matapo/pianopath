"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createClient } from "@/lib/supabase/client";

type ProgressStatus = "not_started" | "in_progress" | "completed";

interface ProgressState {
  lessonProgress: Record<string, ProgressStatus>;
  xpPoints: number;
  currentStreak: number;
  lastActive: string | null;
  completeLesson: (lessonSlug: string) => void;
  startLesson: (lessonSlug: string) => void;
  addXp: (points: number) => void;
  hydrateFromSupabase: (userId: string) => Promise<void>;
  syncToSupabase: (userId: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessonProgress: {},
      xpPoints: 0,
      currentStreak: 0,
      lastActive: null,

      completeLesson: (lessonSlug) =>
        set((state) => ({
          lessonProgress: { ...state.lessonProgress, [lessonSlug]: "completed" },
          xpPoints: state.xpPoints + 50,
        })),

      startLesson: (lessonSlug) =>
        set((state) => ({
          lessonProgress: { ...state.lessonProgress, [lessonSlug]: "in_progress" },
        })),

      addXp: (points) =>
        set((state) => ({ xpPoints: state.xpPoints + points })),

      hydrateFromSupabase: async (userId) => {
        try {
          const supabase = createClient();
          const { data: progressData } = await supabase
            .from("user_progress")
            .select("lesson_id, status")
            .eq("user_id", userId);

          if (progressData) {
            const lessonProgress: Record<string, ProgressStatus> = {};
            for (const row of progressData) {
              lessonProgress[row.lesson_id] = row.status as ProgressStatus;
            }
            set({ lessonProgress });
          }

          const { data: userData } = await supabase
            .from("users")
            .select("xp_points, current_streak_days, last_active")
            .eq("id", userId)
            .single();

          if (userData) {
            set({
              xpPoints: userData.xp_points ?? 0,
              currentStreak: userData.current_streak_days ?? 0,
              lastActive: userData.last_active,
            });
          }
        } catch {
          // localStorage is the source of truth for guests
        }
      },

      syncToSupabase: async (userId) => {
        try {
          const { lessonProgress, xpPoints, currentStreak, lastActive } = get();
          const supabase = createClient();
          const now = new Date().toISOString();

          for (const [lessonId, status] of Object.entries(lessonProgress)) {
            await supabase.from("user_progress").upsert(
              {
                user_id: userId,
                lesson_id: lessonId,
                status,
                updated_at: now,
              },
              { onConflict: "user_id,lesson_id" },
            );
          }

          await supabase
            .from("users")
            .update({
              xp_points: xpPoints,
              current_streak_days: currentStreak,
              last_active: lastActive ?? now,
            })
            .eq("id", userId);
        } catch {
          // silently fail
        }
      },
    }),
    {
      name: "pianopath-progress",
    },
  ),
);
