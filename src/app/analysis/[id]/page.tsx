import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ScoreGauge from "@/components/ScoreGauge";
import AnalysisResultCard from "@/components/AnalysisResultCard";
import RoleSuggestionCard from "@/components/RoleSuggestionCard";
import InterviewQuestionList from "@/components/InterviewQuestionList";
import RecommendedProjectsCard from "@/components/RecommendedProjectsCard";
import { ArrowLeft, FileText, Calendar, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { ResumeAnalysis } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch analysis record joined with resumes and jd_matches
  const { data: analysisRecord, error } = await supabase
    .from("analyses")
    .select(`
      *,
      resumes (file_name, created_at),
      jd_matches (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysisRecord) {
    notFound();
  }

  const resumeData = analysisRecord.resumes as any;
  const jdMatchesData = analysisRecord.jd_matches as any[];
  const primaryJdMatch = jdMatchesData && jdMatchesData.length > 0 ? jdMatchesData[0] : null;

  const analysisPayload: ResumeAnalysis = {
    overall_score: analysisRecord.overall_score,
    strengths: analysisRecord.strengths || [],
    weaknesses: analysisRecord.weaknesses || [],
    formatting_issues: analysisRecord.formatting_issues || [],
    suggested_roles: analysisRecord.suggested_roles || [],
    ats_notes: analysisRecord.ats_notes || "",
    category_scores: analysisRecord.category_scores || {
      content_score: 85,
      ats_essentials_score: 80,
      sections_score: 88,
      hr_red_flags_score: 90,
      seniority_score: 75,
    },
    contact_info: analysisRecord.contact_info || {
      email: "",
      phone: "",
      linkedin: "",
      location: "",
    },
    found_sections: analysisRecord.found_sections || [],
    missing_sections: analysisRecord.missing_sections || [],
    interview_questions: analysisRecord.interview_questions || [],
  };

  const topRole = analysisPayload.suggested_roles?.[0]?.role || "Engineering";
  const primaryStrength = analysisPayload.strengths?.[0] || "technical problem solving";
  const secondStrength = analysisPayload.strengths?.[1] || "hands-on execution";
  const areaToRefine = analysisPayload.weaknesses?.[0] || "quantifying project impact with metrics";

  const interviewQuestions = (primaryJdMatch?.interview_questions && primaryJdMatch.interview_questions.length > 0)
    ? primaryJdMatch.interview_questions
    : (analysisRecord.interview_questions && analysisRecord.interview_questions.length > 0)
    ? analysisRecord.interview_questions
    : [
        `How do you leverage your strength in "${primaryStrength}" when performing as a ${topRole}?`,
        `Describe a specific scenario where you demonstrated "${secondStrength}" to resolve a system challenge.`,
        `How do you address improvement areas like "${areaToRefine}" when delivering high-stakes technical projects?`,
        `What quantifiable metrics or KPIs have you achieved in your past experience that demonstrate engineering impact?`,
        `Walk me through your process for troubleshooting complex technical failures under tight deadlines.`
      ];

  const formattedDate = new Date(analysisRecord.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-8 py-2">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-900 font-bold">{resumeData?.file_name || "Resume"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column: Overall Resume Score */}
          <div className="flex flex-col items-center justify-center lg:border-r lg:border-slate-200/80 lg:pr-8">
            <ScoreGauge score={analysisPayload.overall_score} label="Resume Health Score" size={200} />
          </div>

          {/* Right Column: Key Summary & Optional JD Match Score */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold">
                Executive Overview
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Resume Performance Analysis
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                Your resume scored <span className="font-bold text-slate-900">{analysisPayload.overall_score}/100</span> based on technical impact, ATS readability, formatting consistency, and skill density.
              </p>
            </div>

            {/* Optional JD Match Badge if available */}
            {primaryJdMatch && (
              <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 shadow-md shadow-purple-500/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Target Job Description Match</h4>
                    <p className="text-xs text-purple-700 font-medium">
                      Calculated fit against provided job description
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-purple-200 shadow-xs">
                  <span className="text-xs text-purple-700 font-bold">Match:</span>
                  <span className="text-xl font-black text-slate-900">{primaryJdMatch.match_score}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Job Roles */}
      <RoleSuggestionCard roles={analysisPayload.suggested_roles} />

      {/* Detailed Analysis (Category Breakdown, Contact Info, Section Audit, Strengths, Weaknesses) */}
      <AnalysisResultCard analysis={analysisPayload} />

      {/* Job Description Specific Match (Missing Keywords & Matching Strengths) */}
      {primaryJdMatch && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Missing Keywords */}
          <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200/80 space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">Missing Keywords & Skills</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Skills required by the JD but missing or under-emphasized in your resume:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryJdMatch.missing_keywords && primaryJdMatch.missing_keywords.length > 0 ? (
                primaryJdMatch.missing_keywords.map((keyword: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-xs"
                  >
                    + {keyword}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-medium">No major missing keywords detected!</p>
              )}
            </div>
          </div>

          {/* Matching Strengths */}
          <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Matching Skills & Strengths</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Core competencies from your resume that directly align with the JD requirements:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryJdMatch.matching_strengths && primaryJdMatch.matching_strengths.length > 0 ? (
                primaryJdMatch.matching_strengths.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-medium">Matching skills aligned.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommended GitHub Projects for Target JD */}
      {primaryJdMatch && (
        <RecommendedProjectsCard projects={primaryJdMatch.recommended_projects || []} />
      )}

      {/* Tailored Interview Questions & AI Practice Simulator */}
      <InterviewQuestionList questions={interviewQuestions} analysisId={id} />
    </div>
  );
}
