-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    formatting_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    ats_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create jd_matches table
CREATE TABLE IF NOT EXISTS public.jd_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    jd_text TEXT NOT NULL,
    match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    missing_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    matching_strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    interview_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can manage their own resumes"
    ON public.resumes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analyses
CREATE POLICY "Users can manage their own analyses"
    ON public.analyses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for jd_matches
CREATE POLICY "Users can manage their own jd_matches"
    ON public.jd_matches
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses
            WHERE analyses.id = jd_matches.analysis_id
            AND analyses.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.analyses
            WHERE analyses.id = jd_matches.analysis_id
            AND analyses.user_id = auth.uid()
        )
    );
