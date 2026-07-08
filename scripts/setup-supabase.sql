-- Forest Note Supabase Setup Script v1.0
-- Run this script in Supabase SQL Editor to set up the database schema

-- 1. Users table (linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Diary Entries table (core data)
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT,
  mood INT CHECK (mood >= 0 AND mood <= 10),
  energy INT CHECK (energy >= 0 AND energy <= 10),
  activity TEXT,
  work_time INT,
  image_generated BOOLEAN DEFAULT FALSE,
  ai_title TEXT,
  ai_tags TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- 3. Habit Checks table (daily habits)
CREATE TABLE IF NOT EXISTS habit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  pushups BOOLEAN DEFAULT FALSE,
  squats BOOLEAN DEFAULT FALSE,
  plank BOOLEAN DEFAULT FALSE,
  run BOOLEAN DEFAULT FALSE,
  reading BOOLEAN DEFAULT FALSE,
  ai_learning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(diary_entry_id)
);

-- 4. Indexes (performance optimization)
CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_created ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_diary ON habit_checks(diary_entry_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checks ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for users table
-- Policy: Users can read all public profiles
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (TRUE);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for diary_entries table
-- Policy: Users can read own diary entries
CREATE POLICY "Users can read own diary"
  ON diary_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert own diary entries
CREATE POLICY "Users can insert own diary"
  ON diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update own diary entries
CREATE POLICY "Users can update own diary"
  ON diary_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own diary entries
CREATE POLICY "Users can delete own diary"
  ON diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 8. RLS Policies for habit_checks table
-- Policy: Users can read habits for own diary entries
CREATE POLICY "Users can read own habits"
  ON habit_checks FOR SELECT
  USING (
    diary_entry_id IN (
      SELECT id FROM diary_entries WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert habits for own diary entries
CREATE POLICY "Users can insert own habits"
  ON habit_checks FOR INSERT
  WITH CHECK (
    diary_entry_id IN (
      SELECT id FROM diary_entries WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update habits for own diary entries
CREATE POLICY "Users can update own habits"
  ON habit_checks FOR UPDATE
  USING (
    diary_entry_id IN (
      SELECT id FROM diary_entries WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    diary_entry_id IN (
      SELECT id FROM diary_entries WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete habits for own diary entries
CREATE POLICY "Users can delete own habits"
  ON habit_checks FOR DELETE
  USING (
    diary_entry_id IN (
      SELECT id FROM diary_entries WHERE user_id = auth.uid()
    )
  );

-- 9. Function: Handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers: Auto-update updated_at
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS diary_entries_updated_at ON diary_entries;
CREATE TRIGGER diary_entries_updated_at
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 11. Function: Handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger: Auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ✅ Setup complete!
-- Next: Configure Google OAuth in Supabase Dashboard
-- Docs: https://supabase.com/docs/guides/auth/social-login/auth-google
