import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileText, Calendar, ArrowRight, Sparkles, Target, Award, Database, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let tableMissingError = false;
  let pastAnalyses: any[] = [];

  // Fetch past analyses for logged-in user sorted by date descending
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select(`
      id,
      overall_score,
      suggested_roles,
      created_at,
      resumes (file_name),
      jd_matches (match_score)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    tableMissingError = true;
  } else {
    pastAnalyses = analyses || [];
  }

  return (
    <div className="space-y-8 py-2">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            View past resume analyses, track scores over time, and prepare for interviews.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl gradient-bg text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume Analysis</span>
        </Link>
      </div>

      {/* If Table Missing Error */}
      {tableMissingError ? (
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Database Tables Pending Setup</h3>
              <p className="text-xs text-amber-700 font-medium">
                The database tables (<code className="font-bold">resumes</code>, <code className="font-bold">analyses</code>, <code className="font-bold">jd_matches</code>) have not been created yet in your Supabase project.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-3 text-xs text-slate-700">
            <p className="font-bold text-slate-900">How to setup in 1 minute:</p>
            <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-600">
              <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Supabase Dashboard</a> and go to the <strong>SQL Editor</strong>.</li>
              <li>Run the SQL script located in <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">supabase/migrations/001_initial_schema.sql</code>.</li>
              <li>Refresh this page to start analyzing resumes!</li>
            </ol>
          </div>
        </div>
      ) : pastAnalyses.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-200 text-center max-w-xl mx-auto space-y-6 my-8 shadow-xl">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-50 text-indigo-600 mb-1 shadow-xs">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">No Resume Analyses Yet</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Upload your first resume in PDF or DOCX format to receive detailed score metrics, ATS notes, role suggestions, and custom interview prep questions.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 gradient-bg text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Resume Now</span>
            </Link>
          </div>
        </div>
      ) : (
        /* History Grid List */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900">Past Analyses ({pastAnalyses.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastAnalyses.map((item: any) => {
              const resumeName = item.resumes?.file_name || "Resume";
              const dateStr = new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const score = item.overall_score;
              const roles = item.suggested_roles || [];
              const jdMatch = item.jd_matches && item.jd_matches.length > 0 ? item.jd_matches[0] : null;

              let scoreBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
              if (score >= 80) {
                scoreBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (score >= 60) {
                scoreBadgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
              }

              return (
                <Link
                  key={item.id}
                  href={`/analysis/${item.id}`}
                  className="group glass-card glass-card-hover p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header: File Name & Score Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {resumeName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl border text-xs font-black shrink-0 ${scoreBadgeColor}`}>
                        {score}/100
                      </div>
                    </div>

                    {/* Role Suggestion Badges */}
                    {roles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Suggested Roles
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {roles.slice(0, 2).map((r: any, rIdx: number) => (
                            <span
                              key={rIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold truncate max-w-[180px]"
                            >
                              {r.role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: JD match badge & View Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                    {jdMatch ? (
                      <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                        <Target className="w-3.5 h-3.5 text-purple-600" />
                        <span>JD Match: {jdMatch.match_score}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Standard Analysis</span>
                      </div>
                    )}

                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
