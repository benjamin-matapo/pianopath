-- PianoPath initial schema
-- Tables: users, modules, lessons, user_progress, achievements, user_achievements

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

CREATE TYPE lesson_difficulty AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

CREATE TYPE lesson_type AS ENUM (
  'theory',
  'interactive',
  'song',
  'exercise'
);

CREATE TYPE progress_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- ---------------------------------------------------------------------------
-- Modules
-- ---------------------------------------------------------------------------

CREATE TABLE modules (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  order_index INTEGER     NOT NULL,
  color_hex   TEXT        NOT NULL,
  icon_name   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT modules_order_index_non_negative CHECK (order_index >= 0),
  CONSTRAINT modules_color_hex_format CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE UNIQUE INDEX modules_order_index_unique ON modules (order_index);

-- ---------------------------------------------------------------------------
-- Lessons
-- ---------------------------------------------------------------------------

CREATE TABLE lessons (
  id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT              NOT NULL UNIQUE,
  title             TEXT              NOT NULL,
  description       TEXT,
  order_index       INTEGER           NOT NULL,
  module_id         UUID              NOT NULL REFERENCES modules (id) ON DELETE CASCADE,
  difficulty        lesson_difficulty NOT NULL,
  estimated_minutes INTEGER           NOT NULL,
  lesson_type       lesson_type       NOT NULL,
  content_json      JSONB             NOT NULL DEFAULT '{}',
  is_published      BOOLEAN           NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CONSTRAINT lessons_order_index_non_negative CHECK (order_index >= 0),
  CONSTRAINT lessons_estimated_minutes_positive CHECK (estimated_minutes > 0)
);

CREATE INDEX lessons_module_id_order_index_idx ON lessons (module_id, order_index);
CREATE INDEX lessons_is_published_idx ON lessons (is_published) WHERE is_published = true;

-- ---------------------------------------------------------------------------
-- Users (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id                  UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name        TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_points           INTEGER     NOT NULL DEFAULT 0,
  current_streak_days INTEGER     NOT NULL DEFAULT 0,
  last_active         TIMESTAMPTZ,

  CONSTRAINT users_xp_points_non_negative CHECK (xp_points >= 0),
  CONSTRAINT users_current_streak_days_non_negative CHECK (current_streak_days >= 0)
);

-- ---------------------------------------------------------------------------
-- Achievements (referenced by user_achievements)
-- ---------------------------------------------------------------------------

CREATE TABLE achievements (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  description TEXT,
  icon_name   TEXT,
  xp_reward   INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT achievements_xp_reward_non_negative CHECK (xp_reward >= 0)
);

-- ---------------------------------------------------------------------------
-- User progress
-- ---------------------------------------------------------------------------

CREATE TABLE user_progress (
  user_id      UUID            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lesson_id    UUID            NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  status       progress_status NOT NULL DEFAULT 'not_started',
  score        INTEGER,
  completed_at TIMESTAMPTZ,
  attempts     INTEGER         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, lesson_id),

  CONSTRAINT user_progress_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT user_progress_attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT user_progress_completed_at_when_completed CHECK (
    status <> 'completed' OR completed_at IS NOT NULL
  )
);

CREATE INDEX user_progress_user_id_idx ON user_progress (user_id);
CREATE INDEX user_progress_lesson_id_idx ON user_progress (lesson_id);

-- ---------------------------------------------------------------------------
-- User achievements
-- ---------------------------------------------------------------------------

CREATE TABLE user_achievements (
  user_id        UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  achievement_id UUID        NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX user_achievements_user_id_idx ON user_achievements (user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER user_progress_set_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE modules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Modules: authenticated users can read curriculum structure
CREATE POLICY "modules_select_authenticated"
  ON modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Lessons: authenticated users can read published lessons
CREATE POLICY "lessons_select_published"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Users: each user can read and update their own profile
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Achievements: authenticated users can read the achievement catalog
CREATE POLICY "achievements_select_authenticated"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- User progress: users can only read and write their own progress
CREATE POLICY "user_progress_select_own"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_delete_own"
  ON user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User achievements: users can read their own earned achievements
CREATE POLICY "user_achievements_select_own"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
