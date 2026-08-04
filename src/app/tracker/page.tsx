"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Building, Target, Loader2, Sparkles, Database, ChevronRight, ChevronLeft, FileText, Copy, Check, X } from "lucide-react";

interface Application {
  id: string;
  company_name: string;
  role_title: string;
  status: "wishlist" | "applied" | "interviewing" | "offer" | "rejected";
  job_description?: string;
  match_score?: number;
  created_at: string;
}

const COLUMNS = [
  { id: "wishlist", title: "Wishlist", color: "border-slate-200 bg-slate-50/50 text-slate-700" },
  { id: "applied", title: "Applied", color: "border-blue-200 bg-blue-50/50 text-blue-800" },
  { id: "interviewing", title: "Interviewing", color: "border-purple-200 bg-purple-50/50 text-purple-800" },
  { id: "offer", title: "Offer Received", color: "border-emerald-200 bg-emerald-50/50 text-emerald-800" },
  { id: "rejected", title: "Archived / Rejected", color: "border-rose-200 bg-rose-50/50 text-rose-800" },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissingError, setTableMissingError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [matchScore, setMatchScore] = useState(85);
  const [submitting, setSubmitting] = useState(false);

  // Cover Letter Modal State
  const [activeCoverLetterApp, setActiveCoverLetterApp] = useState<Application | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
      } else if (data.error && (data.error.includes("does not exist") || data.error.includes("schema cache") || data.error.includes("PGRST205"))) {
        setTableMissingError(true);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          role_title: roleTitle.trim(),
          status: "applied",
          match_score: matchScore,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApplications([data.application, ...applications]);
        setShowAddModal(false);
        setCompanyName("");
        setRoleTitle("");
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed to create application:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus as any } : app))
    );

    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    try {
      await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete application:", err);
    }
  };

  const handleOpenCoverLetterModal = async (app: Application) => {
    setActiveCoverLetterApp(app);
    setCoverLetterText(null);
    setGeneratingLetter(true);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: app.company_name,
          role_title: app.role_title,
          job_description: app.job_description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCoverLetterText(data.cover_letter.cover_letter_text);
      } else {
        setCoverLetterText("Failed to generate cover letter.");
      }
    } catch (err) {
      setCoverLetterText("Error connecting to AI service.");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (!coverLetterText) return;
    navigator.clipboard.writeText(coverLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Automated AI Job Tracker
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Job Application Kanban Board
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-0.5 max-w-2xl">
            1-Click auto-saved target roles from your resume analysis, generate AI tailored cover letters, and track application stages.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl gradient-bg text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Job</span>
        </button>
      </div>

      {tableMissingError && (
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 space-y-3">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Applications Table Setup Required</h3>
              <p className="text-xs text-amber-700 font-medium">
                Please run <code className="font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-900">supabase/migrations/002_fullstack_enhancements.sql</code> in your Supabase SQL Editor to enable the Job Application Tracker.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Loading application columns...</span>
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((app) => app.status === col.id);

            return (
              <div key={col.id} className="space-y-4">
                {/* Column Header */}
                <div className={`p-4 rounded-2xl border ${col.color} flex items-center justify-between shadow-xs`}>
                  <h3 className="font-bold text-sm">{col.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-xs font-black border border-slate-200">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[300px]">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="glass-card p-4 rounded-2xl border border-slate-200 space-y-3 hover:border-indigo-300 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {app.role_title}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {app.company_name}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1 text-slate-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {app.match_score !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-medium">
                          <span className="text-slate-400">ATS Fit:</span>
                          <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {app.match_score}%
                          </span>
                        </div>
                      )}

                      {/* AI Cover Letter Generator Button */}
                      <button
                        onClick={() => handleOpenCoverLetterModal(app)}
                        className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>AI Cover Letter</span>
                      </button>

                      {/* Move Column Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                        {col.id !== "wishlist" && (
                          <button
                            onClick={() => {
                              const currIdx = COLUMNS.findIndex((c) => c.id === col.id);
                              if (currIdx > 0) handleUpdateStatus(app.id, COLUMNS[currIdx - 1].id);
                            }}
                            className="hover:text-slate-700 flex items-center gap-0.5"
                          >
                            <ChevronLeft className="w-3 h-3" /> Prev
                          </button>
                        )}
                        <span className="mx-auto" />
                        {col.id !== "rejected" && (
                          <button
                            onClick={() => {
                              const currIdx = COLUMNS.findIndex((c) => c.id === col.id);
                              if (currIdx < COLUMNS.length - 1) handleUpdateStatus(app.id, COLUMNS[currIdx + 1].id);
                            }}
                            className="hover:text-indigo-600 flex items-center gap-0.5"
                          >
                            Next <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                      No jobs in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add New Job Application</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Amazon, OpenAI"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Automation Engineer, Full Stack Dev"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target ATS Match Score (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={matchScore}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) setMatchScore(0);
                    else setMatchScore(Math.min(100, Math.max(0, val)));
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 gradient-bg text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95"
                >
                  {submitting ? "Saving..." : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Cover Letter Generator Modal */}
      {activeCoverLetterApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tailored AI Cover Letter</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeCoverLetterApp.role_title} at {activeCoverLetterApp.company_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCoverLetterApp(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {generatingLetter ? (
                <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="text-sm font-bold">Crafting tailored cover letter with AI...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-line">
                    {coverLetterText}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleCopyCoverLetter}
                      className="px-5 py-3 rounded-xl gradient-bg text-white font-bold text-xs flex items-center gap-2 shadow-md hover:opacity-95"
                    >
                      {copiedLetter ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLetter ? "Copied Cover Letter!" : "Copy Cover Letter"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
