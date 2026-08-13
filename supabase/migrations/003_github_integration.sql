-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    github_username TEXT,
    github_access_token TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create github_projects table
CREATE TABLE IF NOT EXISTS public.github_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    readme_summary TEXT DEFAULT '',
    tech_stack TEXT[] DEFAULT '{}',
    stars INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_repo UNIQUE (user_id, repo_name)
);

-- Add recommended_projects column to jd_matches table if it doesn't exist
ALTER TABLE public.jd_matches 
ADD COLUMN IF NOT EXISTS recommended_projects JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can manage their own profile"
    ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS Policies for github_projects
CREATE POLICY "Users can manage their own github projects"
    ON public.github_projects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
