-- Create applications table for Kanban Tracker
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('wishlist', 'applied', 'interviewing', 'offer', 'rejected')),
    job_description TEXT DEFAULT '',
    match_score INT DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create interview_practice_sessions table
CREATE TABLE IF NOT EXISTS public.interview_practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    star_rating INT NOT NULL DEFAULT 7 CHECK (star_rating >= 1 AND star_rating <= 10),
    feedback_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can manage their own applications"
    ON public.applications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for interview_practice_sessions
CREATE POLICY "Users can manage their own interview practice sessions"
    ON public.interview_practice_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
