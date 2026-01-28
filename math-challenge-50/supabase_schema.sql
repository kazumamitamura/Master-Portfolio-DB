-- Math Challenge 50 Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 6),
  class_name VARCHAR(10) NOT NULL CHECK (class_name IN ('A', 'B', 'C', 'D', 'E')),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Game results table
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 50),
  time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= 50),
  incorrect_count INTEGER NOT NULL CHECK (incorrect_count >= 0 AND incorrect_count <= 50),
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User progress table (unlocked levels)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level_1_unlocked BOOLEAN DEFAULT true NOT NULL,
  level_2_unlocked BOOLEAN DEFAULT false NOT NULL,
  level_3_unlocked BOOLEAN DEFAULT false NOT NULL,
  level_4_unlocked BOOLEAN DEFAULT false NOT NULL,
  best_time_level_1 INTEGER,
  best_time_level_2 INTEGER,
  best_time_level_3 INTEGER,
  best_time_level_4 INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON public.game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_level ON public.game_results(level);
CREATE INDEX IF NOT EXISTS idx_game_results_played_at ON public.game_results(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_grade_class ON public.profiles(grade, class_name);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Game results policies
CREATE POLICY "Users can view their own game results"
  ON public.game_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game results"
  ON public.game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policies (for service role)
-- Note: Service role bypasses RLS, so admin operations should use service role key

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user progress on profile creation
CREATE OR REPLACE FUNCTION initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user progress when profile is created
CREATE TRIGGER create_user_progress_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_progress();

-- Function to unlock next level based on game result
CREATE OR REPLACE FUNCTION unlock_next_level()
RETURNS TRIGGER AS $$
BEGIN
  -- If level 1 completed (score = 50), unlock level 2
  IF NEW.level = 1 AND NEW.score = 50 THEN
    UPDATE public.user_progress
    SET level_2_unlocked = true
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- If level 2 completed (score = 50), unlock level 3
  IF NEW.level = 2 AND NEW.score = 50 THEN
    UPDATE public.user_progress
    SET level_3_unlocked = true
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- If level 3 completed (score = 50), unlock level 4
  IF NEW.level = 3 AND NEW.score = 50 THEN
    UPDATE public.user_progress
    SET level_4_unlocked = true
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Update best time if this is a new record
  IF NEW.score = 50 THEN
    UPDATE public.user_progress
    SET 
      best_time_level_1 = CASE WHEN NEW.level = 1 AND (best_time_level_1 IS NULL OR NEW.time_seconds < best_time_level_1) THEN NEW.time_seconds ELSE best_time_level_1 END,
      best_time_level_2 = CASE WHEN NEW.level = 2 AND (best_time_level_2 IS NULL OR NEW.time_seconds < best_time_level_2) THEN NEW.time_seconds ELSE best_time_level_2 END,
      best_time_level_3 = CASE WHEN NEW.level = 3 AND (best_time_level_3 IS NULL OR NEW.time_seconds < best_time_level_3) THEN NEW.time_seconds ELSE best_time_level_3 END,
      best_time_level_4 = CASE WHEN NEW.level = 4 AND (best_time_level_4 IS NULL OR NEW.time_seconds < best_time_level_4) THEN NEW.time_seconds ELSE best_time_level_4 END
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to unlock levels and update best times
CREATE TRIGGER unlock_levels_on_game_complete
  AFTER INSERT ON public.game_results
  FOR EACH ROW EXECUTE FUNCTION unlock_next_level();
