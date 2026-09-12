-- ==============================================================================
-- AlgoCraft Database Schema for Supabase (PostgreSQL)
-- Execute this script inside your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  streak_count INT DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE,
  preferred_theme TEXT DEFAULT 'indigo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Solutions Table (User's deconstructed DSA problems)
CREATE TABLE IF NOT EXISTS public.solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  problem_title TEXT NOT NULL,
  problem_slug TEXT,
  platform TEXT DEFAULT 'LeetCode',
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic TEXT,
  intuition TEXT,
  optimal_approach JSONB,
  code JSONB,
  dry_run_steps JSONB,
  time_complexity TEXT,
  space_complexity TEXT,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Saved Sheets Table (Custom Curated DSA Problem Sheets)
CREATE TABLE IF NOT EXISTS public.saved_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Flashcard Progress Table (SuperMemo-2 Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.flashcard_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  repetitions INT DEFAULT 0,
  interval INT DEFAULT 1,
  ease_factor NUMERIC(4, 2) DEFAULT 2.50,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, card_id)
);

-- ==============================================================================
-- Row Level Security (RLS) Policies (Users only read & modify their own data)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Solutions Policies
CREATE POLICY "Users can manage their own solutions"
  ON public.solutions FOR ALL
  USING (auth.uid() = user_id);

-- Saved Sheets Policies
CREATE POLICY "Users can manage their own saved sheets"
  ON public.saved_sheets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public sheets are readable by anyone"
  ON public.saved_sheets FOR SELECT
  USING (is_public = true);

-- Flashcard Progress Policies
CREATE POLICY "Users can manage their own flashcard progress"
  ON public.flashcard_progress FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- Auto-create Profile on Signup Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
