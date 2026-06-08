export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LessonDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export type LessonType = "theory" | "interactive" | "song" | "exercise";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon_name: string | null;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          icon_name?: string | null;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          icon_name?: string | null;
          xp_reward?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          order_index: number;
          module_id: string;
          difficulty: LessonDifficulty;
          estimated_minutes: number;
          lesson_type: LessonType;
          content_json: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          order_index: number;
          module_id: string;
          difficulty: LessonDifficulty;
          estimated_minutes: number;
          lesson_type: LessonType;
          content_json?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          module_id?: string;
          difficulty?: LessonDifficulty;
          estimated_minutes?: number;
          lesson_type?: LessonType;
          content_json?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          order_index: number;
          color_hex: string;
          icon_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          order_index: number;
          color_hex: string;
          icon_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          color_hex?: string;
          icon_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          status: ProgressStatus;
          score: number | null;
          completed_at: string | null;
          attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          status?: ProgressStatus;
          score?: number | null;
          completed_at?: string | null;
          attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          lesson_id?: string;
          status?: ProgressStatus;
          score?: number | null;
          completed_at?: string | null;
          attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          xp_points: number;
          current_streak_days: number;
          last_active: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          xp_points?: number;
          current_streak_days?: number;
          last_active?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          xp_points?: number;
          current_streak_days?: number;
          last_active?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lesson_difficulty: LessonDifficulty;
      lesson_type: LessonType;
      progress_status: ProgressStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName]["Update"];

export type Enums<
  EnumName extends keyof DefaultSchema["Enums"],
> = DefaultSchema["Enums"][EnumName];

export type User = Tables<"users">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;
export type Achievement = Tables<"achievements">;
export type UserProgress = Tables<"user_progress">;
export type UserAchievement = Tables<"user_achievements">;
