"use client";

import { useState } from "react";
import Link from "next/link";
import { RecommendedProject } from "@/lib/types";
import { FolderGit2, ExternalLink, Copy, Check, Sparkles, ArrowRight, Code2 } from "lucide-react";

interface RecommendedProjectsCardProps {
  projects: RecommendedProject[];
}

export default function RecommendedProjectsCard({ projects }: RecommendedProjectsCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white shrink-0 shadow-md">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Boost Job Fit with GitHub Projects</h4>
            <p className="text-xs text-slate-600 font-medium">
              Connect your GitHub account in Settings to automatically match your real repositories to job requirements.
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <span>Connect GitHub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-md">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">AI-Matched GitHub Projects</h3>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Featured
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Top repositories from your profile that prove key qualifications requested by this job.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600 shrink-0" />
                {proj.repo_url ? (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-slate-900 text-base hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{proj.repo_name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : (
                  <span className="font-bold text-slate-900 text-base">{proj.repo_name}</span>
                )}
              </div>
            </div>

            {/* Relevance Rationale */}
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800">Why it matches: </span>
              {proj.relevance_explanation}
            </p>

            {/* Suggested Tailored Resume Bullet Point */}
            {proj.suggested_bullet_point && (
              <div className="bg-white p-3.5 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                    Suggested Resume Bullet Point
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    • {proj.suggested_bullet_point}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(`• ${proj.suggested_bullet_point}`, idx)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bullet</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
