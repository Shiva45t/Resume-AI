"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GitHubProjectRecord } from "@/lib/types";
import {
  FolderGit2,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  SlidersHorizontal,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState<GitHubProjectRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfileAndProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingUser(false);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("github_username")
        .eq("id", user.id)
        .single();

      if (profile?.github_username) {
        setUsername(profile.github_username);
      }

      // Fetch existing synced projects
      const { data: projData } = await supabase
        .from("github_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("stars", { ascending: false });

      if (projData) {
        setProjects(projData as GitHubProjectRecord[]);
      }

      setLoadingUser(false);
    }

    loadProfileAndProjects();
  }, [supabase]);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError("Please enter a valid GitHub username.");
      return;
    }

    setSyncing(true);

    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "GitHub sync failed.");
      }

      setProjects(data.projects || []);
      setSuccessMsg(
        `Successfully synced ${data.count} project${data.count === 1 ? "" : "s"} from GitHub with Groq AI summaries!`
      );
    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err.message || "Failed to sync GitHub repositories.");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    const nextVal = !currentFeatured;

    // Optimistic UI state update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_featured: nextVal } : p))
    );

    const { error: updateErr } = await supabase
      .from("github_projects")
      .update({ is_featured: nextVal })
      .eq("id", projectId);

    if (updateErr) {
      console.error("Failed to update project status:", updateErr);
      // Rollback optimistic state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_featured: currentFeatured } : p))
      );
    }
  };

  if (loadingUser) {
    return (
      <div className="py-16 text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading settings...</span>
      </div>
    );
  }

  const featuredCount = projects.filter((p) => p.is_featured).length;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-indigo-600" />
            <span>Profile & GitHub Integration</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Connect your public GitHub repositories so AI can match your real-world projects against Job Descriptions.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sync Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-md">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">GitHub Connection</h2>
              <p className="text-xs text-slate-500 font-medium">
                No OAuth permissions needed. Enter your public GitHub handle.
              </p>
            </div>
          </div>

          {projects.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{featuredCount} / {projects.length} Repos Featured</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSync} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="github-username"
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={syncing || !username.trim()}
            className="py-3 px-6 gradient-bg text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing & Summarizing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync Projects</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Synced Repositories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>Synced Projects ({projects.length})</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Toggle switch ON to include a project in AI Job Description matching.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Projects Synced Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Enter your public GitHub handle above and click <strong>"Sync Projects"</strong> to import your top repositories with AI summaries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                  proj.is_featured
                    ? "bg-white border-indigo-200 shadow-md shadow-indigo-500/5 hover:border-indigo-300"
                    : "bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-indigo-600 text-base flex items-center gap-1.5 transition-colors"
                      >
                        <span>{proj.repo_name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {proj.stars} stars
                        </span>
                      </div>
                    </div>

                    {/* Feature Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={proj.is_featured}
                        onChange={() => handleToggleFeatured(proj.id, proj.is_featured)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* AI Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {proj.readme_summary || proj.description || "No summary available."}
                  </p>
                </div>

                {/* Tech Stack Tags */}
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {proj.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
