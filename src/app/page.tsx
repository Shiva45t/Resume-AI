import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, FileText, Target, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Next-Gen AI Career Assistant
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Supercharge Your Career with <span className="gradient-text">ResumeIQ</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Upload your resume to receive instantaneous AI feedback, ATS score evaluation, tailored job role suggestions, and targeted interview preparation questions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 gradient-bg text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Analyze Your Resume Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold text-base rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 w-fit">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Instant Feedback & ATS Score</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Uncover formatting issues, bullet-point impact gaps, and ATS parser flags before applying to top companies.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-200/80 space-y-4 hover:border-purple-300 transition-all">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 w-fit">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Job Description Matching</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Paste any job description to compare match scores, identify missing keywords, and bridge critical qualification gaps.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Tailored Interview Prep</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generate 8–10 realistic behavioral, technical, and gap-probing interview questions customized to your specific profile.
          </p>
        </div>
      </section>

      {/* Security & Privacy Banner */}
      <section className="glass-card p-8 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shrink-0 shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Secure & Private Data Isolation</h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Protected by Supabase Row Level Security (RLS). Your resume content is strictly isolated to your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
