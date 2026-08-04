"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, MapPin, DollarSign, Building, Loader2, Bookmark, Check, ArrowUpRight, Filter, FileText, Copy, X } from "lucide-react";
import { JobListing } from "@/lib/ai/findJobs";

export default function JobFinderPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  // Cover Letter Modal
  const [activeJobForCoverLetter, setActiveJobForCoverLetter] = useState<JobListing | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  useEffect(() => {
    fetchJobs("");
  }, []);

  const fetchJobs = async (queryStr: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryStr }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Job search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchQuery);
  };

  const handleSaveToTracker = async (job: JobListing) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: job.company,
          role_title: job.title,
          status: "wishlist",
          match_score: job.match_score,
          job_description: job.description,
        }),
      });

      if (res.ok) {
        setSavedJobs((prev) => ({ ...prev, [job.id]: true }));
      }
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  const handleOpenCoverLetter = async (job: JobListing) => {
    setActiveJobForCoverLetter(job);
    setCoverLetterText(null);
    setGeneratingLetter(true);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: job.company,
          role_title: job.title,
          job_description: job.description,
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

  const filteredJobs = jobs.filter((j) => {
    if (filterType === "All") return true;
    return j.type === filterType;
  });

  return (
    <div className="space-y-8 py-2 w-full">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Resume Match Job Finder
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Discover Tailored Opportunities
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-2xl">
            Our AI matches open job opportunities directly against your verified resume skills and target roles.
          </p>
        </div>

        {/* Live Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Job Title, Keyword, or Technology (e.g., PLC, React, Embedded)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-all"
            />
          </div>
          <button
            type="submit"
            className="py-3.5 px-6 rounded-2xl gradient-bg text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search Jobs</span>
          </button>
        </form>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" /> Work Type:
          </span>
          {["All", "Remote", "Hybrid", "On-site"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filterType === t
                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-sm font-bold">Matching open roles against your CV skills with AI...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 space-y-3">
          <p className="text-base font-bold text-slate-700">No matching jobs found for "{searchQuery}"</p>
          <p className="text-xs">Try searching for keywords like "Automation", "PLC", "Developer", or "Engineer".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const isSaved = savedJobs[job.id];

            return (
              <div
                key={job.id}
                className="glass-card p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all space-y-4 shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badge & Match Score */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      {job.match_score}% Resume Fit
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{job.posted_date}</span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      {job.company}
                    </p>
                  </div>

                  {/* Location, Type, Salary */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {job.location} ({job.type})
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {job.salary}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {job.description}
                  </p>

                  {/* Required Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.required_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenCoverLetter(job)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Cover Letter</span>
                  </button>

                  <button
                    onClick={() => !isSaved && handleSaveToTracker(job)}
                    disabled={isSaved}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSaved
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>

                  <a
                    href="https://www.linkedin.com/jobs/"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl gradient-bg text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-500/20 hover:opacity-95"
                  >
                    <span>Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cover Letter Modal */}
      {activeJobForCoverLetter && (
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
                    {activeJobForCoverLetter.title} at {activeJobForCoverLetter.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveJobForCoverLetter(null)}
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
                      onClick={() => {
                        if (coverLetterText) {
                          navigator.clipboard.writeText(coverLetterText);
                          setCopiedLetter(true);
                          setTimeout(() => setCopiedLetter(false), 2000);
                        }
                      }}
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
