import { CheckCircle, AlertTriangle, FileWarning, Info, UserCheck, ShieldCheck, Award, Layers, Mail, Phone, Globe, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { ResumeAnalysis } from "@/lib/types";

interface AnalysisResultCardProps {
  analysis: ResumeAnalysis;
}

export default function AnalysisResultCard({ analysis }: AnalysisResultCardProps) {
  const { 
    strengths, 
    weaknesses, 
    formatting_issues, 
    ats_notes,
    category_scores,
    contact_info,
    found_sections,
    missing_sections
  } = analysis;

  const contentScore = category_scores?.content_score ?? 85;
  const atsEssentialsScore = category_scores?.ats_essentials_score ?? 80;
  const sectionsScore = category_scores?.sections_score ?? 88;
  const hrRedFlagsScore = category_scores?.hr_red_flags_score ?? 90;
  const seniorityScore = category_scores?.seniority_score ?? 75;

  return (
    <div className="space-y-8">
      {/* Category Breakdown Score Grid */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Layers className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900">Detailed Audit Categories</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            5 Core Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Content Score */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Impact</span>
            <div className="text-2xl font-black text-indigo-600">{contentScore}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${contentScore}%` }} />
            </div>
          </div>

          {/* ATS Essentials */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ATS Essentials</span>
            <div className="text-2xl font-black text-purple-600">{atsEssentialsScore}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${atsEssentialsScore}%` }} />
            </div>
          </div>

          {/* Sections Audit */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sections Audit</span>
            <div className="text-2xl font-black text-emerald-600">{sectionsScore}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${sectionsScore}%` }} />
            </div>
          </div>

          {/* HR Red Flags */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HR Safety</span>
            <div className="text-2xl font-black text-amber-600">{hrRedFlagsScore}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: `${hrRedFlagsScore}%` }} />
            </div>
          </div>

          {/* Seniority */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seniority Fit</span>
            <div className="text-2xl font-black text-rose-600">{seniorityScore}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full transition-all" style={{ width: `${seniorityScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Contact Info & Section Completeness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Contact Info */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <UserCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900">Parsed Contact Info</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {contact_info?.email && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 truncate">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{contact_info.email}</span>
              </div>
            )}
            {contact_info?.phone && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 truncate">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{contact_info.phone}</span>
              </div>
            )}
            {contact_info?.linkedin && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 truncate">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{contact_info.linkedin}</span>
              </div>
            )}
            {contact_info?.location && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 truncate">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">{contact_info.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section Audit */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900">Sections Completeness Audit</h3>
          </div>

          <div className="space-y-2 pt-1">
            {found_sections && found_sections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {found_sections.map((sec, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {sec}
                  </span>
                ))}
              </div>
            )}

            {missing_sections && missing_sections.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block w-full">Missing Sections:</span>
                {missing_sections.map((sec, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    {sec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid for Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Key Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200/80 space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2.5">
            {weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formatting & ATS Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formatting Issues */}
        {formatting_issues && formatting_issues.length > 0 && (
          <div className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200/80 space-y-4">
            <div className="flex items-center gap-2 text-rose-800">
              <FileWarning className="w-5 h-5 shrink-0 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-900">Formatting & Structural Fixes</h3>
            </div>
            <ul className="space-y-2.5">
              {formatting_issues.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ATS Notes */}
        {ats_notes && (
          <div className="bg-indigo-50/60 p-6 rounded-3xl border border-indigo-200/80 space-y-4">
            <div className="flex items-center gap-2 text-indigo-800">
              <Info className="w-5 h-5 shrink-0 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">ATS Optimization Notes</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {ats_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
