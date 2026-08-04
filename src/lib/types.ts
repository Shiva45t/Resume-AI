import { z } from "zod";

// --- AI Response Schemas & Types ---

export const SuggestedRoleSchema = z.object({
  role: z.string(),
  reason: z.string(),
});

export const ContactInfoSchema = z.object({
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  location: z.string().optional().default(""),
});

export const CategoryScoresSchema = z.object({
  content_score: z.number().int().min(0).max(100).optional().default(85),
  ats_essentials_score: z.number().int().min(0).max(100).optional().default(80),
  sections_score: z.number().int().min(0).max(100).optional().default(88),
  hr_red_flags_score: z.number().int().min(0).max(100).optional().default(90),
  seniority_score: z.number().int().min(0).max(100).optional().default(75),
});

export const ResumeAnalysisSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  formatting_issues: z.array(z.string()),
  suggested_roles: z.array(SuggestedRoleSchema),
  ats_notes: z.string().optional().default(""),
  category_scores: CategoryScoresSchema.optional().default({
    content_score: 85,
    ats_essentials_score: 80,
    sections_score: 88,
    hr_red_flags_score: 90,
    seniority_score: 75,
  }),
  contact_info: ContactInfoSchema.optional().default({
    email: "",
    phone: "",
    linkedin: "",
    location: "",
  }),
  found_sections: z.array(z.string()).optional().default([]),
  missing_sections: z.array(z.string()).optional().default([]),
  interview_questions: z.array(z.string()).optional().default([]),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

export const JDMatchSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  missing_keywords: z.array(z.string()),
  matching_strengths: z.array(z.string()).optional().default([]),
  interview_questions: z.array(z.string()),
});

export type JDMatch = z.infer<typeof JDMatchSchema>;

// --- Database Table Row Definitions ---

export interface ResumeRecord {
  id: string;
  user_id: string;
  file_name: string;
  raw_text: string;
  created_at: string;
}

export interface AnalysisRecord {
  id: string;
  resume_id: string;
  user_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  formatting_issues: string[];
  suggested_roles: { role: string; reason: string }[];
  ats_notes?: string;
  category_scores?: {
    content_score?: number;
    ats_essentials_score?: number;
    sections_score?: number;
    hr_red_flags_score?: number;
    seniority_score?: number;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  found_sections?: string[];
  missing_sections?: string[];
  created_at: string;
  resumes?: ResumeRecord;
  jd_matches?: JDMatchRecord[];
}

export interface JDMatchRecord {
  id: string;
  analysis_id: string;
  jd_text: string;
  match_score: number;
  missing_keywords: string[];
  matching_strengths: string[];
  interview_questions: string[];
  created_at: string;
}
