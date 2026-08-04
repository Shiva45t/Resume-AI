import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, TrendingUp, Award, Layers, ShieldCheck, UserCheck, ArrowLeft, ArrowUpRight } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const records = analyses || [];

  const totalAnalyses = records.length;
  const avgOverallScore = totalAnalyses > 0
    ? Math.round(records.reduce((acc, r) => acc + (r.overall_score || 0), 0) / totalAnalyses)
    : 0;

  const highestScore = totalAnalyses > 0
    ? Math.max(...records.map((r) => r.overall_score || 0))
    : 0;

  return (
    <div className="space-y-8 py-2 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Full-Stack Resume Performance Insights
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Analytics & Score Progress Trends
        </h1>
        <p className="text-sm text-slate-600 font-medium max-w-xl">
          Track score improvements across multiple resume iterations and evaluate category performance averages.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Average Resume Health</span>
          <div className="text-3xl font-black text-indigo-600">{avgOverallScore} <span className="text-xs text-slate-400 font-bold">/ 100</span></div>
          <p className="text-xs text-slate-500 font-medium">Calculated across {totalAnalyses} analyzed documents</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Highest Achieved Score</span>
          <div className="text-3xl font-black text-emerald-600">{highestScore} <span className="text-xs text-slate-400 font-bold">/ 100</span></div>
          <p className="text-xs text-slate-500 font-medium">Peak performance iteration</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Resume Iterations</span>
          <div className="text-3xl font-black text-purple-600">{totalAnalyses}</div>
          <p className="text-xs text-slate-500 font-medium">Stored analysis records</p>
        </div>
      </div>

      {/* Score Progress Chart Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-indigo-600">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-900">Score Progression Over Time</h3>
        </div>

        {totalAnalyses > 0 ? (
          <div className="space-y-4 pt-2">
            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
              {records.map((r: any, idx: number) => {
                const heightPercent = Math.max((r.overall_score / 100) * 100, 10);
                const dateLabel = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

                return (
                  <div key={r.id || idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-xs font-black text-indigo-600 group-hover:scale-110 transition-transform">
                      {r.overall_score}
                    </span>
                    <div
                      className="w-full max-w-[40px] gradient-bg rounded-t-xl transition-all shadow-md group-hover:opacity-90"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[50px]">
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            No score data available yet. Upload your first resume to see visual progress trends!
          </div>
        )}
      </div>
    </div>
  );
}
