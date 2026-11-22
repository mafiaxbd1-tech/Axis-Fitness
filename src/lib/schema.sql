-- ====================================================================
-- AXIS FITNESS — Supabase Schema & RLS Migration
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Create user_config Table (Stores soft-coded customizations)
CREATE TABLE IF NOT EXISTS public.user_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    workouts JSONB NOT NULL,
    meals JSONB NOT NULL,
    protein_sources JSONB NOT NULL,
    macro_targets JSONB NOT NULL,
    user_stats JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS user_config_user_id_idx ON public.user_config(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

-- Owner-scoped RLS policies
CREATE POLICY "Users can view their own config" 
    ON public.user_config FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config" 
    ON public.user_config FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" 
    ON public.user_config FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config" 
    ON public.user_config FOR DELETE 
    USING (auth.uid() = user_id);


-- 2. Create today_state Table (Stores live checkbox completion for BST today)
CREATE TABLE IF NOT EXISTS public.today_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date TEXT NOT NULL, -- Format: YYYY-MM-DD in BST
    workout JSONB NOT NULL, -- Checkbox states for workouts
    diet JSONB NOT NULL, -- Checkbox states for meals & macros
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS today_state_user_id_idx ON public.today_state(user_id);
ALTER TABLE public.today_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own today_state" 
    ON public.today_state FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own today_state" 
    ON public.today_state FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own today_state" 
    ON public.today_state FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own today_state" 
    ON public.today_state FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. Create history Table (Stores reverse-chronological logged past days)
CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date TEXT NOT NULL, -- YYYY-MM-DD
    day_id TEXT NOT NULL, -- MON, TUE, etc.
    workout_snapshot JSONB NOT NULL,
    diet_snapshot JSONB NOT NULL,
    status TEXT NOT NULL, -- Full, Partial, Skipped
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS history_user_id_idx ON public.history(user_id);
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" 
    ON public.history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
    ON public.history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" 
    ON public.history FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
    ON public.history FOR DELETE 
    USING (auth.uid() = user_id);
